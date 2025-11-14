package com.talentiq.backend.controller;

import com.talentiq.backend.dto.AdminStatsResponse;
import com.talentiq.backend.dto.JobResponse;
import com.talentiq.backend.dto.PagedResponse;
import com.talentiq.backend.dto.UpdateRoleRequest;
import com.talentiq.backend.dto.UserManagementResponse;
import com.talentiq.backend.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")

@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // Get all users with pagination
    @GetMapping("/users")
    public ResponseEntity<PagedResponse<UserManagementResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        return ResponseEntity.ok(adminService.getAllUsers(page, size, sortBy, sortDirection));
    }

    // Get detailed user statistics by user ID
    @GetMapping("/users/{userId}/stats")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserStats(userId));
    }

    // Update user role
    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserManagementResponse> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(adminService.updateUserRole(id, request));
    }

    // Delete user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    // Get all jobs (admin view)
    @GetMapping("/jobs")
    public ResponseEntity<PagedResponse<JobResponse>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {
        return ResponseEntity.ok(adminService.getAllJobsAdmin(page, size, sortBy, sortDirection));
    }

    // Delete any job (admin override)
    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        adminService.deleteJobAdmin(id);
        return ResponseEntity.ok().build();
    }

    // Get platform statistics
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getPlatformStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }
}