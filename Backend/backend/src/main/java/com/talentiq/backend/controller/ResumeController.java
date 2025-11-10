package com.talentiq.backend.controller;

import com.talentiq.backend.dto.ResumeResponse;
import com.talentiq.backend.model.User;
import com.talentiq.backend.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
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
@CrossOrigin(origins = "http://localhost:5173")
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
        String extractedText = resumeService.getExtractedText(id, user);
        Map<String, String> response = new HashMap<>();
        response.put("resumeId", id.toString());
        response.put("extractedText", extractedText);
        return ResponseEntity.ok(response);
    }

    // Download/Preview resume file (Job Seeker only - their own resumes)
    @GetMapping("/{id}/file")
    @PreAuthorize("hasAuthority('ROLE_JOB_SEEKER')")
    public ResponseEntity<Resource> downloadResumeFile(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Resource file = resumeService.getResumeFile(id, user);
        String filename = resumeService.getResumeFilename(id, user);

        // Determine content type based on file extension
        String contentType = "application/octet-stream";
        if (filename.toLowerCase().endsWith(".pdf")) {
            contentType = "application/pdf";
        } else if (filename.toLowerCase().endsWith(".docx")) {
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (filename.toLowerCase().endsWith(".doc")) {
            contentType = "application/msword";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(file);
    }

    // NEW: Recruiter endpoint to view resume from application
    @GetMapping("/{id}/file/recruiter")
    @PreAuthorize("hasAuthority('ROLE_RECRUITER')")
    public ResponseEntity<Resource> downloadResumeFileForRecruiter(
            @PathVariable Long id,
            @AuthenticationPrincipal User recruiter) {
        System.out.println("🔍 ResumeController - Recruiter accessing resume:");
        System.out.println("   Resume ID: " + id);
        System.out.println("   Recruiter Email: " + recruiter.getEmail());
        System.out.println("   Recruiter ID: " + recruiter.getId());
        System.out.println("   Recruiter Role: " + recruiter.getRole());
        System.out.println("   Recruiter Authorities: " + recruiter.getAuthorities());

        Resource file = resumeService.getResumeFileForRecruiter(id, recruiter);
        String filename = resumeService.getResumeFilenameForRecruiter(id, recruiter);

        // Determine content type based on file extension
        String contentType = "application/octet-stream";
        if (filename.toLowerCase().endsWith(".pdf")) {
            contentType = "application/pdf";
        } else if (filename.toLowerCase().endsWith(".docx")) {
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (filename.toLowerCase().endsWith(".doc")) {
            contentType = "application/msword";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(file);
    }

    // Delete resume
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_JOB_SEEKER')")
    public ResponseEntity<Void> deleteResume(@PathVariable Long id,
                                             @AuthenticationPrincipal User user) {
        resumeService.deleteResume(id, user);
        return ResponseEntity.ok().build();
    }
}