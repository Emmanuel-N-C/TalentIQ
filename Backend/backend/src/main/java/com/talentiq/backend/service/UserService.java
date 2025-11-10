package com.talentiq.backend.service;

import com.talentiq.backend.dto.ChangePasswordRequest;
import com.talentiq.backend.dto.ProfileResponse;
import com.talentiq.backend.dto.UpdateProfileRequest;
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

    @Value("${file.upload-dir:uploads/resumes}")
    private String uploadDir;

    private final String profilePictureDir = "uploads/profile-pictures";

    public ProfileResponse getCurrentUserProfile(User user) {
        String profilePictureUrl = null;
        if (user.getProfilePicturePath() != null) {
            profilePictureUrl = "/api/user/profile-picture/" + user.getId();
        }

        return new ProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getProfilePicturePath(),
                profilePictureUrl,
                user.getPhone(),
                user.getLocation(),
                user.getBio(),
                user.getCompanyName(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
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

    @Transactional
    public void changePassword(ChangePasswordRequest request, User user) {
        User userToUpdate = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

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

        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && 
                                   !contentType.equals("image/png") && 
                                   !contentType.equals("image/jpg"))) {
            throw new RuntimeException("Only JPEG and PNG images are allowed");
        }

        // Check file size (5MB max)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size must not exceed 5MB");
        }

        try {
            // Create directory if it doesn't exist
            Path uploadPath = Paths.get(profilePictureDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Delete old profile picture if exists
            if (userToUpdate.getProfilePicturePath() != null) {
                try {
                    Path oldFilePath = Paths.get(userToUpdate.getProfilePicturePath());
                    Files.deleteIfExists(oldFilePath);
                } catch (IOException e) {
                    System.err.println("Could not delete old profile picture: " + e.getMessage());
                }
            }

            // Generate unique filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String newFilename = "profile_" + user.getId() + "_" + UUID.randomUUID() + fileExtension;

            // Save file
            Path targetLocation = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Update user profile picture path
            String relativePath = profilePictureDir + "/" + newFilename;
            userToUpdate.setProfilePicturePath(relativePath);
            userRepository.save(userToUpdate);

            return getCurrentUserProfile(userToUpdate);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store profile picture: " + e.getMessage());
        }
    }

    public Resource loadProfilePicture(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getProfilePicturePath() == null) {
            throw new RuntimeException("No profile picture found");
        }

        try {
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

    @Transactional
    public void deleteProfilePicture(User user) {
        User userToUpdate = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userToUpdate.getProfilePicturePath() != null) {
            try {
                Path filePath = Paths.get(userToUpdate.getProfilePicturePath());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                System.err.println("Could not delete profile picture: " + e.getMessage());
            }

            userToUpdate.setProfilePicturePath(null);
            userRepository.save(userToUpdate);
        }
    }
}

