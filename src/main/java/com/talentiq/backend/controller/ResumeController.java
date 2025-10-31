package com.talentiq.backend.controller;

import com.talentiq.backend.dto.ResumeResponse;
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
@CrossOrigin(origins = "http://localhost:5173")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    // Upload resume with automatic text extraction
    @PostMapping("/upload")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<ResumeResponse> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resumeService.uploadResume(file, user));
    }

    // Get user's resumes
    @GetMapping
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<List<ResumeResponse>> getUserResumes(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resumeService.getUserResumes(user));
    }

    // Get extracted text from a specific resume
    @GetMapping("/{id}/text")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<Map<String, String>> getExtractedText(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        String extractedText = resumeService.getExtractedText(id, user);
        Map<String, String> response = new HashMap<>();
        response.put("resumeId", id.toString());
        response.put("extractedText", extractedText);
        return ResponseEntity.ok(response);
    }

    // Delete resume
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('JOB_SEEKER')")
    public ResponseEntity<Void> deleteResume(@PathVariable Long id,
                                             @AuthenticationPrincipal User user) {
        resumeService.deleteResume(id, user);
        return ResponseEntity.ok().build();
    }
}