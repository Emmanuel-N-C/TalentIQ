package com.talentiq.backend.controller;

import com.talentiq.backend.dto.JobRequest;
import com.talentiq.backend.dto.JobResponse;
import com.talentiq.backend.dto.PagedResponse;
import com.talentiq.backend.model.User;
import com.talentiq.backend.service.JobService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "http://localhost:5173")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<JobResponse> createJob(@Valid @RequestBody JobRequest request,
                                                 @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(jobService.createJob(request, user));
    }

    // Original endpoint - returns all jobs without pagination (for backward compatibility)
    @GetMapping
    public ResponseEntity<List<JobResponse>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    // New paginated endpoint
    @GetMapping("/paginated")
    public ResponseEntity<PagedResponse<JobResponse>> getAllJobsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        return ResponseEntity.ok(jobService.getAllJobsPaginated(page, size, sortBy, sortDirection));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJobResponseById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<JobResponse> updateJob(@PathVariable Long id,
                                                 @Valid @RequestBody JobRequest request,
                                                 @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(jobService.updateJob(id, request, user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id,
                                          @AuthenticationPrincipal User user) {
        jobService.deleteJob(id, user);
        return ResponseEntity.ok().build();
    }

    // Simple keyword search endpoint
    @GetMapping("/search")
    public ResponseEntity<PagedResponse<JobResponse>> searchJobs(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        return ResponseEntity.ok(jobService.searchJobs(keyword, page, size, sortBy, sortDirection));
    }

    // Advanced search with multiple filters
    @GetMapping("/search/advanced")
    public ResponseEntity<PagedResponse<JobResponse>> advancedSearchJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String skills,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        return ResponseEntity.ok(jobService.advancedSearchJobs(
                title, company, skills, experienceLevel, page, size, sortBy, sortDirection));
    }
}