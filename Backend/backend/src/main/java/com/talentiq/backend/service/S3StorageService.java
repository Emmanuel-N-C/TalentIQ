package com.talentiq.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.UUID;

@Service
public class S3StorageService {

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.access-key-id}")
    private String accessKeyId;

    @Value("${aws.secret-access-key}")
    private String secretAccessKey;

    @Value("${aws.s3.enabled:true}")
    private boolean s3Enabled;

    private S3Client s3Client;

    @PostConstruct
    public void initialize() {
        if (s3Enabled) {
            AwsBasicCredentials awsCreds = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
            this.s3Client = S3Client.builder()
                    .region(Region.of(region))
                    .credentialsProvider(StaticCredentialsProvider.create(awsCreds))
                    .build();
            System.out.println("✅ S3 Client initialized successfully");
            System.out.println("   Bucket: " + bucketName);
            System.out.println("   Region: " + region);
        } else {
            System.out.println("⚠️ S3 is disabled in configuration");
        }
    }

    /**
     * Upload file to S3 and return public URL
     *
     * @param file The file to upload
     * @param folder The folder path (e.g., "profile-pictures", "resumes")
     * @return The public URL of the uploaded file
     */
    public String uploadFile(MultipartFile file, String folder) {
        if (!s3Enabled) {
            throw new RuntimeException("S3 storage is not enabled");
        }

        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
            String key = folder + "/" + uniqueFilename;

            // Determine content type
            String contentType = file.getContentType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // Upload to S3
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

            // Generate public URL
            String publicUrl = String.format("https://%s.s3.%s.amazonaws.com/%s",
                    bucketName, region, key);

            System.out.println("✅ File uploaded to S3: " + publicUrl);
            return publicUrl;

        } catch (IOException e) {
            System.err.println("❌ Failed to upload file to S3: " + e.getMessage());
            throw new RuntimeException("Failed to upload file to S3: " + e.getMessage(), e);
        }
    }

    /**
     * Delete file from S3
     *
     * @param fileUrl The public URL of the file to delete
     */
    public void deleteFile(String fileUrl) {
        if (!s3Enabled) {
            return;
        }

        try {
            // Extract key from URL
            // URL format: https://bucket-name.s3.region.amazonaws.com/folder/filename
            String key = extractKeyFromUrl(fileUrl);

            if (key == null || key.isEmpty()) {
                System.err.println("⚠️ Could not extract key from URL: " + fileUrl);
                return;
            }

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            System.out.println("✅ File deleted from S3: " + key);

        } catch (Exception e) {
            System.err.println("❌ Failed to delete file from S3: " + e.getMessage());
            // Don't throw exception - deletion failure shouldn't stop the operation
        }
    }

    /**
     * Check if a file exists in S3
     *
     * @param fileUrl The public URL of the file
     * @return true if file exists, false otherwise
     */
    public boolean fileExists(String fileUrl) {
        if (!s3Enabled) {
            return false;
        }

        try {
            String key = extractKeyFromUrl(fileUrl);
            if (key == null || key.isEmpty()) {
                return false;
            }

            HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.headObject(headObjectRequest);
            return true;

        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            System.err.println("❌ Error checking file existence: " + e.getMessage());
            return false;
        }
    }

    /**
     * Extract S3 key from public URL
     * URL format: https://bucket-name.s3.region.amazonaws.com/folder/filename.ext
     *
     * @param url The public S3 URL
     * @return The S3 key (folder/filename.ext)
     */
    private String extractKeyFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }

        try {
            // Format: https://bucket-name.s3.region.amazonaws.com/KEY
            String[] parts = url.split(".amazonaws.com/");
            if (parts.length > 1) {
                return parts[1];
            }
        } catch (Exception e) {
            System.err.println("⚠️ Error extracting key from URL: " + e.getMessage());
        }

        return null;
    }

    /**
     * Get the public URL for a file
     *
     * @param key The S3 key (folder/filename)
     * @return The public URL
     */
    public String getPublicUrl(String key) {
        return String.format("https://%s.s3.%s.amazonaws.com/%s",
                bucketName, region, key);
    }

    public boolean isS3Enabled() {
        return s3Enabled;
    }
}