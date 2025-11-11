package com.talentiq.backend.service;

import com.talentiq.backend.dto.ChangePasswordRequest;
import com.talentiq.backend.dto.ProfileResponse;
import com.talentiq.backend.dto.UpdateProfileRequest;
import com.talentiq.backend.model.AuthProvider;
import com.talentiq.backend.model.User;
import com.talentiq.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${file.upload-dir:uploads/profile-pictures}")
    private String uploadDir;

    public ProfileResponse getCurrentUserProfile(User user) {
        User fullUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String profilePictureUrl = null;
        if (fullUser.getProfilePicturePath() != null) {
            profilePictureUrl = "/api/user/profile-picture/" + fullUser.getId();
        }

        ProfileResponse response = new ProfileResponse(
                fullUser.getId(),
                fullUser.getEmail(),
                fullUser.getFullName(),
                fullUser.getRole().name(),
                fullUser.getProfilePicturePath(),
                profilePictureUrl,
                fullUser.getPhone(),
                fullUser.getLocation(),
                fullUser.getBio(),
                fullUser.getCompanyName(),
                fullUser.getCreatedAt(),
                fullUser.getUpdatedAt()
        );

        // Add authProvider
        response.setAuthProvider(fullUser.getAuthProvider().name());

        return response;
    }

    @Transactional
    public ProfileResponse updateProfile(UpdateProfileRequest request, User user) {
        User userToUpdate = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            userToUpdate.setFullName(request.getFullName());
        }
        if (request.getPhone() != null) {
            userToUpdate.setPhone(request.getPhone());
        }
        if (request.getLocation() != null) {
            userToUpdate.setLocation(request.getLocation());
        }
        if (request.getBio() != null) {
            userToUpdate.setBio(request.getBio());
        }
        if (request.getCompanyName() != null) {
            userToUpdate.setCompanyName(request.getCompanyName());
        }

        userRepository.save(userToUpdate);
        return getCurrentUserProfile(userToUpdate);
    }

    /**
     * Change password
     * FIXED: Block OAuth users from changing passwords
     */
    @Transactional
    public void changePassword(ChangePasswordRequest request, User user) {
        User userToUpdate = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Block OAuth users from changing passwords
        if (userToUpdate.getAuthProvider() != AuthProvider.LOCAL) {
            throw new IllegalStateException("Password cannot be changed for " + userToUpdate.getAuthProvider().name() + " accounts");
        }

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), userToUpdate.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Validate new password strength
        if (request.getNewPassword().length() < 8) {
            throw new RuntimeException("New password must be at least 8 characters long");
        }

        // Update password
        userToUpdate.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(userToUpdate);
    }

    @Transactional
    public ProfileResponse uploadProfilePicture(MultipartFile file, User user) {
        User userToUpdate = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            // Validate file
            if (file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.equals("image/jpeg") &&
                    !contentType.equals("image/png") &&
                    !contentType.equals("image/jpg"))) {
                throw new RuntimeException("Only JPG, JPEG, and PNG images are allowed");
            }

            // Validate file size (5MB max)
            long maxSize = 5 * 1024 * 1024;
            if (file.getSize() > maxSize) {
                throw new RuntimeException("File size exceeds maximum limit of 5MB");
            }

            // Generate unique filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = "profile_" + user.getId() + "_" + UUID.randomUUID() + fileExtension;

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Delete old profile picture if exists
            if (userToUpdate.getProfilePicturePath() != null) {
                try {
                    Path oldFile = Paths.get(userToUpdate.getProfilePicturePath());
                    Files.deleteIfExists(oldFile);
                } catch (IOException e) {
                    // Log but don't fail if old file can't be deleted
                    System.err.println("Could not delete old profile picture: " + e.getMessage());
                }
            }

            // Save new file
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Update user
            userToUpdate.setProfilePicturePath(filePath.toString());
            userRepository.save(userToUpdate);

            return getCurrentUserProfile(userToUpdate);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store profile picture: " + e.getMessage());
        }
    }

    /**
     * Delete profile picture
     */
    @Transactional
    public void deleteProfilePicture(User user) {
        User userToUpdate = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userToUpdate.getProfilePicturePath() != null) {
            try {
                // Delete file from disk
                Path filePath = Paths.get(userToUpdate.getProfilePicturePath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                System.err.println("Could not delete profile picture file: " + e.getMessage());
                // Continue anyway to clear the database reference
            }

            // Clear profile picture path in database
            userToUpdate.setProfilePicturePath(null);
            userRepository.save(userToUpdate);
        }
    }

    public Resource loadProfilePicture(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getProfilePicturePath() == null) {
                throw new RuntimeException("No profile picture found for this user");
            }

            Path filePath = Paths.get(user.getProfilePicturePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Profile picture not found or not readable");
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error loading profile picture: " + e.getMessage());
        }
    }
}