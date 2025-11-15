package com.talentiq.backend.service;

import com.talentiq.backend.dto.ChangePasswordRequest;
import com.talentiq.backend.dto.ProfileResponse;
import com.talentiq.backend.dto.UpdateProfileRequest;
import com.talentiq.backend.model.AuthProvider;
import com.talentiq.backend.model.Resume;
import com.talentiq.backend.model.User;
import com.talentiq.backend.repository.ResumeRepository;
import com.talentiq.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private S3StorageService s3StorageService;

    public ProfileResponse getCurrentUserProfile(User user) {
        User fullUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Return the S3 URL directly (no need for /api/user/profile-picture endpoint)
        String profilePictureUrl = fullUser.getProfilePicturePath();

        ProfileResponse response = new ProfileResponse(
                fullUser.getId(),
                fullUser.getEmail(),
                fullUser.getFullName(),
                fullUser.getRole().name(),
                fullUser.getProfilePicturePath(),
                profilePictureUrl,  // Now returns full S3 URL
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

        // Update basic info
        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            userToUpdate.setFullName(request.getFullName().trim());
        }

        if (request.getPhone() != null) {
            userToUpdate.setPhone(request.getPhone().trim());
        }

        if (request.getLocation() != null) {
            userToUpdate.setLocation(request.getLocation().trim());
        }

        if (request.getBio() != null) {
            userToUpdate.setBio(request.getBio().trim());
        }

        // Update company name for recruiters
        if (request.getCompanyName() != null) {
            userToUpdate.setCompanyName(request.getCompanyName().trim());
        }

        userRepository.save(userToUpdate);

        return getCurrentUserProfile(userToUpdate);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request, User user) {
        User userToUpdate = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is using OAuth
        if (userToUpdate.getAuthProvider() != AuthProvider.LOCAL) {
            throw new RuntimeException("Cannot change password for OAuth users. Please use your " +
                    userToUpdate.getAuthProvider().name() + " account to manage your password.");
        }

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), userToUpdate.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // FIXED: ChangePasswordRequest only has newPassword, not confirmPassword
        // Frontend should validate confirmation before sending

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

            System.out.println("📸 Uploading profile picture for user: " + user.getId());

            // Delete old profile picture from S3 if exists
            if (userToUpdate.getProfilePicturePath() != null) {
                try {
                    s3StorageService.deleteFile(userToUpdate.getProfilePicturePath());
                    System.out.println("🗑️ Old profile picture deleted from S3");
                } catch (Exception e) {
                    System.err.println("⚠️ Could not delete old profile picture: " + e.getMessage());
                    // Continue anyway
                }
            }

            // Upload to S3
            String s3Url = s3StorageService.uploadFile(file, "profile-pictures");
            System.out.println("✅ Profile picture uploaded to S3: " + s3Url);

            // Update user with S3 URL
            userToUpdate.setProfilePicturePath(s3Url);
            userRepository.save(userToUpdate);

            return getCurrentUserProfile(userToUpdate);

        } catch (Exception e) {
            System.err.println("❌ Failed to upload profile picture: " + e.getMessage());
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
                // Delete from S3
                s3StorageService.deleteFile(userToUpdate.getProfilePicturePath());
                System.out.println("✅ Profile picture deleted from S3");
            } catch (Exception e) {
                System.err.println("⚠️ Could not delete profile picture from S3: " + e.getMessage());
                // Continue anyway to clear the database reference
            }

            // Clear profile picture path in database
            userToUpdate.setProfilePicturePath(null);
            userRepository.save(userToUpdate);
        }
    }

    // NOTE: This method is NO LONGER NEEDED with S3
    // Profile pictures are served directly from S3 URLs
    // You can remove the controller endpoint /api/user/profile-picture/{userId}
    @Deprecated
    public Resource loadProfilePicture(Long userId) {
        throw new RuntimeException("Profile pictures are now served directly from S3. Use profilePictureUrl from the user profile.");
    }

    /**
     * DELETE USER ACCOUNT - Hard delete with full cascade
     */
    @Transactional
    public void deleteUserAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        System.out.println("🗑️ Deleting user account: " + user.getEmail() + " (ID: " + userId + ")");

        // Delete profile picture from S3 if exists
        if (user.getProfilePicturePath() != null) {
            try {
                s3StorageService.deleteFile(user.getProfilePicturePath());
                System.out.println("   ✅ Profile picture deleted from S3");
            } catch (Exception e) {
                System.err.println("   ⚠️ Could not delete profile picture: " + e.getMessage());
            }
        }

        // Delete resumes from S3 if job seeker
        if (user.getRole().name().equals("JOB_SEEKER")) {
            List<Resume> userResumes = resumeRepository.findByUserId(userId);
            for (Resume resume : userResumes) {
                try {
                    s3StorageService.deleteFile(resume.getFilePath());
                    System.out.println("   ✅ Resume deleted from S3: " + resume.getFilename());
                } catch (Exception e) {
                    System.err.println("   ⚠️ Could not delete resume: " + e.getMessage());
                }
            }
        }

        // Delete user (cascade will handle database relations)
        userRepository.delete(user);
        System.out.println("✅ User account deleted successfully");
    }
}