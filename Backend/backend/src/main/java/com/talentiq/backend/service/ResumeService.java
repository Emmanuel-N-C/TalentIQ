package com.talentiq.backend.service;

import com.talentiq.backend.dto.ResumeResponse;
import com.talentiq.backend.model.Resume;
import com.talentiq.backend.model.User;
import com.talentiq.backend.repository.ResumeRepository;
import com.talentiq.backend.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private ResumeParserService resumeParserService;

    @Autowired
    private ApplicationRepository applicationRepository;

    /**
     * Upload a resume with automatic text extraction
     */
    @Transactional
    public ResumeResponse uploadResume(MultipartFile file, User user) {
        System.out.println("📤 Uploading resume for user: " + user.getEmail());

        // Validate file
        if (file.isEmpty()) {
            throw new RuntimeException("Please select a file to upload");
        }

        String filename = file.getOriginalFilename();
        if (!resumeParserService.isSupportedFormat(filename)) {
            throw new RuntimeException("Unsupported file format. Please upload PDF, DOCX, DOC, or TXT files.");
        }

        try {
            // Store file
            String filePath = fileStorageService.storeFile(file);

            // Extract text from resume
            String extractedText = resumeParserService.extractText(filePath);

            if (extractedText == null || extractedText.trim().isEmpty()) {
                throw new RuntimeException("Failed to extract text from resume. The file might be empty or corrupted.");
            }

            // Create Resume entity
            Resume resume = new Resume();
            resume.setUser(user);
            resume.setFilename(filename);
            resume.setFilePath(filePath);
            resume.setFileSize(file.getSize());
            resume.setMimeType(file.getContentType());
            resume.setExtractedText(extractedText);

            // Save to database
            Resume savedResume = resumeRepository.save(resume);

            System.out.println("✅ Resume uploaded successfully with ID: " + savedResume.getId());

            return convertToResponse(savedResume);

        } catch (Exception e) {
            System.err.println("❌ Error uploading resume: " + e.getMessage());
            throw new RuntimeException("Failed to upload resume: " + e.getMessage(), e);
        }
    }

    /**
     * Get all resumes for a user
     */
    public List<ResumeResponse> getUserResumes(User user) {
        List<Resume> resumes = resumeRepository.findByUserIdOrderByUploadedAtDesc(user.getId());
        return resumes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get extracted text from a specific resume
     */
    public String getExtractedText(Long resumeId, User user) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + resumeId));

        // Verify ownership
        if (!resume.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only access your own resumes");
        }

        return resume.getExtractedText();
    }

    /**
     * Get resume file as Resource for download/preview
     */
    public Resource getResumeFile(Long resumeId, User user) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + resumeId));

        // Verify ownership
        if (!resume.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only access your own resumes");
        }

        try {
            Path filePath = Paths.get(resume.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Resume file not found or not readable");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error loading resume file: " + e.getMessage());
        }
    }

    /**
     * Get resume filename
     */
    public String getResumeFilename(Long resumeId, User user) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + resumeId));

        // Verify ownership
        if (!resume.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only access your own resumes");
        }

        return resume.getFilename();
    }

    /**
     * Get resume file for recruiter (with application verification)
     * FLEXIBLE VERSION: Works with old and new applications
     */
    public Resource getResumeFileForRecruiter(Long resumeId, User recruiter) {
        System.out.println("🔍 RESUME ACCESS REQUEST:");
        System.out.println("   Resume ID: " + resumeId);
        System.out.println("   Recruiter ID: " + recruiter.getId());
        System.out.println("   Recruiter Email: " + recruiter.getEmail());
        System.out.println("   Recruiter Role: " + recruiter.getRole());
        
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + resumeId));

        System.out.println("   Resume Owner ID: " + resume.getUser().getId());
        System.out.println("   Resume Owner Email: " + resume.getUser().getEmail());
        
        // Check 1: Direct check - does an application exist with this specific resume?
        boolean hasAccessThroughApplication = applicationRepository.existsByResumeIdAndJobRecruiterId(resumeId, recruiter.getId());
        System.out.println("   Direct Access (resume_id match): " + hasAccessThroughApplication);

        // Check 2: Indirect check - has this user (resume owner) applied to any of recruiter's jobs?
        // This works for old applications that don't have resume_id properly set
        boolean hasAccessThroughJobApplication = applicationRepository.existsByUserIdAndJobRecruiterId(resume.getUser().getId(), recruiter.getId());
        System.out.println("   Indirect Access (user applied to recruiter's jobs): " + hasAccessThroughJobApplication);

        if (!hasAccessThroughApplication && !hasAccessThroughJobApplication) {
            System.err.println("❌ ACCESS DENIED");
            System.err.println("   Reason: No application found linking this resume to recruiter's jobs");
            throw new RuntimeException("You do not have permission to access this resume");
        }

        System.out.println("✅ ACCESS GRANTED");

        try {
            Path filePath = Paths.get(resume.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Resume file not found or not readable");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error loading resume file: " + e.getMessage());
        }
    }

    /**
     * Get resume filename for recruiter
     * FLEXIBLE VERSION: Works with old and new applications
     */
    public String getResumeFilenameForRecruiter(Long resumeId, User recruiter) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + resumeId));

        // Same flexible check as above
        boolean hasAccessThroughApplication = applicationRepository.existsByResumeIdAndJobRecruiterId(resumeId, recruiter.getId());
        boolean hasAccessThroughJobApplication = applicationRepository.existsByUserIdAndJobRecruiterId(resume.getUser().getId(), recruiter.getId());

        System.out.println("🔍 Filename check - Direct access: " + hasAccessThroughApplication + ", Indirect access: " + hasAccessThroughJobApplication);

        if (!hasAccessThroughApplication && !hasAccessThroughJobApplication) {
            throw new RuntimeException("You do not have permission to access this resume");
        }

        return resume.getFilename();
    }

    /**
     * Delete a resume
     */
    @Transactional
    public void deleteResume(Long resumeId, User user) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + resumeId));

        // Verify ownership
        if (!resume.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own resumes");
        }

        System.out.println("🗑️ Deleting resume: " + resume.getFilename());

        // Delete file from disk
        fileStorageService.deleteFile(resume.getFilePath());

        // Delete from database
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
                resume.getFilePath(),
                resume.getFileSize(),
                resume.getMimeType(),
                resume.getUploadedAt(),
                resume.getUser().getId()
        );

        // Add preview of extracted text (first 200 characters)
        if (resume.getExtractedText() != null && !resume.getExtractedText().isEmpty()) {
            String preview = resume.getExtractedText().substring(
                    0,
                    Math.min(200, resume.getExtractedText().length())
            );
            response.setExtractedTextPreview(preview + "...");
        }

        return response;
    }
}