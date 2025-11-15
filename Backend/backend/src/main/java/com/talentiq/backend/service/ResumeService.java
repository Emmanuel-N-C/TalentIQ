package com.talentiq.backend.service;

import com.talentiq.backend.dto.ResumeResponse;
import com.talentiq.backend.model.Application;
import com.talentiq.backend.model.Match;
import com.talentiq.backend.model.Resume;
import com.talentiq.backend.model.User;
import com.talentiq.backend.repository.ApplicationRepository;
import com.talentiq.backend.repository.MatchRepository;
import com.talentiq.backend.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private S3StorageService s3StorageService;

    @Autowired
    private ResumeParserService resumeParserService;

    /**
     * Upload a new resume
     */
    @Transactional
    public ResumeResponse uploadResume(MultipartFile file, User user) {
        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("application/pdf")
                && !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                && !contentType.equals("application/msword")
                && !contentType.equals("text/plain"))) {
            throw new RuntimeException("Only PDF, DOCX, DOC, and TXT files are allowed");
        }

        // Validate file size (10MB max)
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new RuntimeException("File size exceeds maximum limit of 10MB");
        }

        System.out.println("📄 Uploading resume: " + file.getOriginalFilename());
        System.out.println("   Size: " + file.getSize() + " bytes");
        System.out.println("   Type: " + contentType);

        // Upload file to S3
        String s3Url = s3StorageService.uploadFile(file, "resumes");
        System.out.println("✅ Resume uploaded to S3: " + s3Url);

        // FIXED: Parse resume text from MultipartFile (save to temp file first)
        String extractedText = extractTextFromMultipartFile(file);
        System.out.println("✅ Extracted text length: " + (extractedText != null ? extractedText.length() : 0) + " chars");

        // Create and save resume entity
        Resume resume = new Resume();
        resume.setUser(user);
        resume.setFilename(file.getOriginalFilename());
        resume.setFilePath(s3Url);  // Store S3 URL instead of local path
        resume.setFileSize(file.getSize());
        resume.setMimeType(contentType);
        resume.setExtractedText(extractedText);

        resume = resumeRepository.save(resume);
        System.out.println("✅ Resume saved with ID: " + resume.getId());

        return convertToResponse(resume);
    }

    /**
     * Helper method to extract text from MultipartFile
     * FIXED: ResumeParserService expects a file path, so we save temporarily
     */
    private String extractTextFromMultipartFile(MultipartFile file) {
        try {
            // Create temporary file
            Path tempFile = Files.createTempFile("resume_", "_" + file.getOriginalFilename());
            file.transferTo(tempFile.toFile());

            // Extract text using the temporary file path
            String extractedText = resumeParserService.extractText(tempFile.toString());

            // Delete temporary file
            Files.deleteIfExists(tempFile);

            return extractedText;
        } catch (IOException e) {
            System.err.println("⚠️ Warning: Could not extract text from resume: " + e.getMessage());
            return ""; // Return empty string if extraction fails
        }
    }

    /**
     * Get all resumes for a user
     */
    public List<ResumeResponse> getUserResumes(User user) {
        List<Resume> resumes = resumeRepository.findByUserId(user.getId());
        return resumes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific resume by ID
     */
    public Resume getResumeById(Long id, User user) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + id));

        // Verify ownership
        if (!resume.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to access this resume");
        }

        return resume;
    }

    /**
     * Get resume file URL (now returns S3 URL directly)
     */
    public String getResumeFileUrl(Long id, User user) {
        Resume resume = getResumeById(id, user);
        return resume.getFilePath();  // Returns S3 URL
    }

    /**
     * Get resume file URL for recruiter (from application)
     */
    public String getResumeFileUrlForRecruiter(Long resumeId, User recruiter) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + resumeId));

        // Check if recruiter has access through application
        boolean hasAccessThroughApplication = applicationRepository.existsByResumeIdAndJobRecruiterId(resumeId, recruiter.getId());
        boolean hasAccessThroughJobApplication = applicationRepository.existsByUserIdAndJobRecruiterId(resume.getUser().getId(), recruiter.getId());

        System.out.println("🔍 Resume access check:");
        System.out.println("   Direct (new apps): " + hasAccessThroughApplication);
        System.out.println("   Indirect (old apps): " + hasAccessThroughJobApplication);

        if (!hasAccessThroughApplication && !hasAccessThroughJobApplication) {
            throw new RuntimeException("You do not have permission to access this resume");
        }

        return resume.getFilePath();  // Returns S3 URL
    }

    /**
     * Get resume filename for recruiter
     */
    public String getResumeFilenameForRecruiter(Long resumeId, User recruiter) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + resumeId));

        // Check permissions (same as above)
        boolean hasAccessThroughApplication = applicationRepository.existsByResumeIdAndJobRecruiterId(resumeId, recruiter.getId());
        boolean hasAccessThroughJobApplication = applicationRepository.existsByUserIdAndJobRecruiterId(resume.getUser().getId(), recruiter.getId());

        if (!hasAccessThroughApplication && !hasAccessThroughJobApplication) {
            throw new RuntimeException("You do not have permission to access this resume");
        }

        return resume.getFilename();
    }

    /**
     * Delete a resume
     */
    @Transactional
    public void deleteResume(Long id, User user) {
        Resume resume = getResumeById(id, user);

        System.out.println("🗑️ Deleting resume with ID: " + id);

        // FIXED: Use correct repository method names
        // Delete related matches by job ID
        List<Match> relatedMatches = matchRepository.findByResumeUserId(user.getId())
                .stream()
                .filter(match -> match.getResume() != null && match.getResume().getId().equals(id))
                .collect(Collectors.toList());

        if (!relatedMatches.isEmpty()) {
            matchRepository.deleteAll(relatedMatches);
            System.out.println("   ✅ Deleted " + relatedMatches.size() + " related matches");
        }

        // Delete related applications by user ID (filter by resume)
        List<Application> relatedApplications = applicationRepository.findByUserId(user.getId())
                .stream()
                .filter(app -> app.getResume() != null && app.getResume().getId().equals(id))
                .collect(Collectors.toList());

        if (!relatedApplications.isEmpty()) {
            applicationRepository.deleteAll(relatedApplications);
            System.out.println("   ✅ Deleted " + relatedApplications.size() + " related applications");
        }

        // Delete file from S3
        try {
            s3StorageService.deleteFile(resume.getFilePath());
            System.out.println("   ✅ Resume file deleted from S3");
        } catch (Exception e) {
            System.err.println("   ⚠️ Warning: Could not delete file from S3: " + e.getMessage());
            // Continue with database deletion even if S3 deletion fails
        }

        // Delete resume from database
        resumeRepository.delete(resume);

        System.out.println("✅ Resume deleted successfully");
    }

    /**
     * Convert Resume entity to ResumeResponse DTO
     */
    private ResumeResponse convertToResponse(Resume resume) {
        ResumeResponse response = new ResumeResponse(
                resume.getId(),
                resume.getFilename(),
                resume.getFilePath(),  // Now returns S3 URL
                resume.getFileSize(),
                resume.getMimeType(),
                resume.getUploadedAt(),
                resume.getUser().getId()
        );

        // Add preview of extracted text (first 200 chars)
        if (resume.getExtractedText() != null && !resume.getExtractedText().isEmpty()) {
            String preview = resume.getExtractedText().substring(
                    0,
                    Math.min(200, resume.getExtractedText().length())
            );
            response.setExtractedTextPreview(preview);
        }

        return response;
    }

    // NOTE: These methods are NO LONGER NEEDED with S3
    // Resumes are accessed directly via S3 URLs
    @Deprecated
    public Resource getResumeFile(Long id, User user) {
        throw new RuntimeException("Resume files are now served directly from S3. Use the S3 URL from getResumeFileUrl()");
    }

    @Deprecated
    public Resource getResumeFileForRecruiter(Long resumeId, User recruiter) {
        throw new RuntimeException("Resume files are now served directly from S3. Use the S3 URL from getResumeFileUrlForRecruiter()");
    }
}