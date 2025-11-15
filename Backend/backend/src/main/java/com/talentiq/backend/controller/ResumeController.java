package com.talentiq.backend.controller;

import com.talentiq.backend.dto.ResumeResponse;
import com.talentiq.backend.model.Resume;
import com.talentiq.backend.model.User;
import com.talentiq.backend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    // Upload resume with automatic text extraction
    @PostMapping("/upload")
    @PreAuthorize("hasAuthority('ROLE_JOB_SEEKER')")
    public ResponseEntity<ResumeResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resumeService.uploadResume(file, user));
    }

    // Get user's resumes
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_JOB_SEEKER')")
    public ResponseEntity<List<ResumeResponse>> getUserResumes(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resumeService.getUserResumes(user));
    }

    // Get extracted text from a specific resume
    @GetMapping("/{id}/text")
    @PreAuthorize("hasAuthority('ROLE_JOB_SEEKER')")
    public ResponseEntity<Map<String, String>> getExtractedText(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Resume resume = resumeService.getResumeById(id, user);
        String extractedText = resume.getExtractedText();

        Map<String, String> response = new HashMap<>();
        response.put("resumeId", id.toString());
        response.put("extractedText", extractedText != null ? extractedText : "");
        return ResponseEntity.ok(response);
    }

    // NEW: Get S3 URL for job seeker's own resume
    @GetMapping("/{id}/url")
    @PreAuthorize("hasAuthority('ROLE_JOB_SEEKER')")
    public ResponseEntity<Map<String, String>> getResumeUrl(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        String s3Url = resumeService.getResumeFileUrl(id, user);
        Map<String, String> response = new HashMap<>();
        response.put("url", s3Url);
        response.put("message", "Resume is now served directly from S3");
        return ResponseEntity.ok(response);
    }

    // NEW: Get S3 URL for recruiter to view resume from application
    @GetMapping("/{id}/url/recruiter")
    @PreAuthorize("hasAuthority('ROLE_RECRUITER')")
    public ResponseEntity<Map<String, String>> getResumeUrlForRecruiter(
            @PathVariable Long id,
            @AuthenticationPrincipal User recruiter) {
        System.out.println("🔍 ResumeController - Recruiter requesting resume URL:");
        System.out.println("   Resume ID: " + id);
        System.out.println("   Recruiter ID: " + recruiter.getId());

        String s3Url = resumeService.getResumeFileUrlForRecruiter(id, recruiter);
        String filename = resumeService.getResumeFilenameForRecruiter(id, recruiter);

        Map<String, String> response = new HashMap<>();
        response.put("url", s3Url);
        response.put("filename", filename);
        response.put("message", "Resume is now served directly from S3");
        return ResponseEntity.ok(response);
    }

    // Delete resume
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_JOB_SEEKER')")
    public ResponseEntity<Void> deleteResume(@PathVariable Long id,
                                             @AuthenticationPrincipal User user) {
        resumeService.deleteResume(id, user);
        return ResponseEntity.ok().build();
    }

    // DEPRECATED: Old file download endpoints (kept for backward compatibility)
    // Frontend should now use the /url endpoints and open S3 URLs directly

    @Deprecated
    @GetMapping("/{id}/file")
    @PreAuthorize("hasAuthority('ROLE_JOB_SEEKER')")
    public ResponseEntity<Map<String, String>> downloadResumeFile(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        String s3Url = resumeService.getResumeFileUrl(id, user);
        Map<String, String> response = new HashMap<>();
        response.put("url", s3Url);
        response.put("message", "Files are now served from S3. Use the URL to access the file.");
        return ResponseEntity.ok(response);
    }

    @Deprecated
    @GetMapping("/{id}/file/recruiter")
    @PreAuthorize("hasAuthority('ROLE_RECRUITER')")
    public ResponseEntity<Map<String, String>> downloadResumeFileForRecruiter(
            @PathVariable Long id,
            @AuthenticationPrincipal User recruiter) {
        String s3Url = resumeService.getResumeFileUrlForRecruiter(id, recruiter);
        String filename = resumeService.getResumeFilenameForRecruiter(id, recruiter);

        Map<String, String> response = new HashMap<>();
        response.put("url", s3Url);
        response.put("filename", filename);
        response.put("message", "Files are now served from S3. Use the URL to access the file.");
        return ResponseEntity.ok(response);
    }
}