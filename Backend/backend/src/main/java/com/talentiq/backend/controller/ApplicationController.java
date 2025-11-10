package com.talentiq.backend.controller;

import com.talentiq.backend.dto.ApplicationRequest;
import com.talentiq.backend.dto.ApplicationResponse;
import com.talentiq.backend.dto.JobStatsResponse;
import com.talentiq.backend.model.Application;
import com.talentiq.backend.model.User;
import com.talentiq.backend.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    // Job seeker applies to a job
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_JOB_SEEKER')")
    public ResponseEntity<ApplicationResponse> createApplication(
            @Valid @RequestBody ApplicationRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.createApplication(request, user));
    }

    // Job seeker views their applications
    @GetMapping("/my-applications")
    @PreAuthorize("hasAuthority('ROLE_JOB_SEEKER')")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.getUserApplications(user));
    }

    // Recruiter views applications for a specific job
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasAuthority('ROLE_RECRUITER')")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsForJob(
            @PathVariable Long jobId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.getApplicationsForJob(jobId, user));
    }

    // Recruiter views all applications across all their jobs
    @GetMapping("/recruiter/all")
    @PreAuthorize("hasAuthority('ROLE_RECRUITER')")
    public ResponseEntity<List<ApplicationResponse>> getAllRecruiterApplications(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.getAllRecruiterApplications(user));
    }

    // Recruiter updates application status
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_RECRUITER')")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam Application.ApplicationStatus status,
            @RequestParam(required = false) String notes,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(id, status, notes, user));
    }

    // Recruiter views statistics for a job
    @GetMapping("/job/{jobId}/stats")
    @PreAuthorize("hasAuthority('ROLE_RECRUITER')")
    public ResponseEntity<JobStatsResponse> getJobStats(
            @PathVariable Long jobId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.getJobStats(jobId, user));
    }
}