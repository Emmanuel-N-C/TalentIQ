package com.talentiq.backend.controller;

import com.talentiq.backend.dto.ChangePasswordRequest;
import com.talentiq.backend.dto.ProfileResponse;
import com.talentiq.backend.dto.UpdateProfileRequest;
import com.talentiq.backend.model.User;
import com.talentiq.backend.repository.UserRepository;
import com.talentiq.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    // Get current user profile
    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getCurrentUserProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getCurrentUserProfile(user));
    }

    // Update user profile
    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.updateProfile(request, user));
    }

    // Change password
    @PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User user) {
        try {
            userService.changePassword(request, user);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password changed successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Upload profile picture
    @PostMapping("/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        try {
            ProfileResponse response = userService.uploadProfilePicture(file, user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // Get profile picture (public access for any user to view profile pictures)
    // This endpoint is used by recruiters to view applicant profile pictures
    @GetMapping("/profile-picture/{userId}")
    public ResponseEntity<Resource> getProfilePicture(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (user.getProfilePicturePath() == null) {
                return ResponseEntity.notFound().build();
            }

            Path filePath = Paths.get(user.getProfilePicturePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    // Fallback content type detection based on filename
                    String filename = resource.getFilename();
                    if (filename != null) {
                        if (filename.toLowerCase().endsWith(".png")) {
                            contentType = "image/png";
                        } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
                            contentType = "image/jpeg";
                        } else if (filename.toLowerCase().endsWith(".gif")) {
                            contentType = "image/gif";
                        } else {
                            contentType = "application/octet-stream";
                        }
                    } else {
                        contentType = "application/octet-stream";
                    }
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete profile picture
    @DeleteMapping("/profile-picture")
    public ResponseEntity<Map<String, String>> deleteProfilePicture(@AuthenticationPrincipal User user) {
        userService.deleteProfilePicture(user);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Profile picture deleted successfully");
        return ResponseEntity.ok(response);
    }
}