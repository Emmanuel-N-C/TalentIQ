package com.talentiq.backend.service;

import com.talentiq.backend.dto.ResumeResponse;
import com.talentiq.backend.model.Resume;
import com.talentiq.backend.model.User;
import com.talentiq.backend.model.Application;
import com.talentiq.backend.model.Match;
import com.talentiq.backend.repository.ResumeRepository;
import com.talentiq.backend.repository.ApplicationRepository;
import com.talentiq.backend.repository.MatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
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
    private FileStorageService fileStorageService;

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

        // Save file to disk
        String filePath = fileStorageService.storeFile(file);
        System.out.println("✅ File stored at: " + filePath);

        // Parse resume text
        String extractedText = resumeParserService.extractText(filePath);
        System.out.println("✅ Extracted text length: " + (extractedText != null ? extractedText.length() : 0) + " chars");

        // Create and save resume entity
        Resume resume = new Resume();
        resume.setUser(user);
        resume.setFilename(file.getOriginalFilename());
        resume.setFilePath(filePath);
        resume.setFileSize(file.getSize());
        resume.setMimeType(contentType);
        resume.setExtractedText(extractedText);

        resume = resumeRepository.save(resume);
        System.out.println("✅ Resume saved with ID: " + resume.getId());

        return convertToResponse(resume);
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
     * Get resume file for download
     */
    public Resource getResumeFile(Long id, User user) {
        Resume resume = getResumeById(id, user);
        return loadFileAsResource(resume.getFilePath());
    }

    /**
     * Get resume file for recruiter (from application)
     * FLEXIBLE VERSION: Works with old and new applications
     */
    public Resource getResumeFileForRecruiter(Long resumeId, User recruiter) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + resumeId));

        // FLEXIBLE CHECK: Accept both old and new application types
        // 1. Direct check: Does application have resume_id pointing to this resume AND recruiter owns the job?
        boolean hasAccessThroughApplication = applicationRepository.existsByResumeIdAndJobRecruiterId(resumeId, recruiter.getId());

        // 2. Indirect check: Does application link this user to a job owned by this recruiter? (old applications)
        boolean hasAccessThroughJobApplication = applicationRepository.existsByUserIdAndJobRecruiterId(resume.getUser().getId(), recruiter.getId());

        System.out.println("🔍 Resume access check:");
        System.out.println("   Direct (new apps): " + hasAccessThroughApplication);
        System.out.println("   Indirect (old apps): " + hasAccessThroughJobApplication);

        if (!hasAccessThroughApplication && !hasAccessThroughJobApplication) {
            throw new RuntimeException("You do not have permission to access this resume");
        }

        return loadFileAsResource(resume.getFilePath());
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
     * FIXED: Now handles cascade deletion of related data
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

        // STEP 1: Delete all applications that reference this resume
        List<Application> userApplications = applicationRepository.findByUserId(user.getId());
        List<Application> relatedApplications = userApplications.stream()
                .filter(app -> app.getResume() != null && app.getResume().getId().equals(resumeId))
                .collect(Collectors.toList());

        if (!relatedApplications.isEmpty()) {
            System.out.println("   🗑️ Deleting " + relatedApplications.size() + " related applications");
            applicationRepository.deleteAll(relatedApplications);
        }

        // STEP 2: Delete all matches that reference this resume
        List<Match> userMatches = matchRepository.findByResumeUserId(user.getId());
        List<Match> relatedMatches = userMatches.stream()
                .filter(match -> match.getResume().getId().equals(resumeId))
                .collect(Collectors.toList());

        if (!relatedMatches.isEmpty()) {
            System.out.println("   🗑️ Deleting " + relatedMatches.size() + " related matches");
            matchRepository.deleteAll(relatedMatches);
        }

        // STEP 3: Delete file from disk
        try {
            fileStorageService.deleteFile(resume.getFilePath());
            System.out.println("   ✅ File deleted from disk");
        } catch (Exception e) {
            System.err.println("   ⚠️ Warning: Could not delete file from disk: " + e.getMessage());
            // Continue with database deletion even if file deletion fails
        }

        // STEP 4: Delete resume from database
        resumeRepository.delete(resume);

        System.out.println("✅ Resume deleted successfully");
    }

    /**
     * Load file as Resource for download
     */
    private Resource loadFileAsResource(String filePath) {
        try {
            Path path = Paths.get(filePath).normalize();
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or not readable: " + filePath);
            }
        } catch (MalformedURLException ex) {
            throw new RuntimeException("File not found: " + filePath, ex);
        }
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
}