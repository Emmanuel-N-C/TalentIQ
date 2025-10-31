package com.talentiq.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    // Initialize storage location
    public void init() {
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory!", e);
        }
    }

    // Store file and return the stored file path
    public String storeFile(MultipartFile file) {
        // Initialize directory if not exists
        init();

        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file");
        }

        // Get original filename
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());

        // Validate filename
        if (originalFilename.contains("..")) {
            throw new RuntimeException("Invalid file path: " + originalFilename);
        }

        // Validate file type
        String contentType = file.getContentType();
        if (!isValidFileType(contentType)) {
            throw new RuntimeException("Invalid file type. Only PDF and DOCX files are allowed.");
        }

        try {
            // Generate unique filename to avoid conflicts
            String fileExtension = getFileExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Store file
            Path targetLocation = Paths.get(uploadDir).resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return the stored file path
            return targetLocation.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + originalFilename, e);
        }
    }

    // Validate file type
    private boolean isValidFileType(String contentType) {
        return contentType != null && (
                contentType.equals("application/pdf") ||
                        contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                        contentType.equals("application/msword")
        );
    }

    // Get file extension
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            return filename.substring(lastDotIndex);
        }
        return "";
    }

    // Delete file
    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + filePath, e);
        }
    }
}