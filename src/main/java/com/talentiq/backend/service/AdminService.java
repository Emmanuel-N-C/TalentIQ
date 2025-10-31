package com.talentiq.backend.service;

import com.talentiq.backend.dto.AdminStatsResponse;
import com.talentiq.backend.dto.JobResponse;
import com.talentiq.backend.dto.PagedResponse;
import com.talentiq.backend.dto.UpdateRoleRequest;
import com.talentiq.backend.dto.UserManagementResponse;
import com.talentiq.backend.model.Job;
import com.talentiq.backend.model.Resume;
import com.talentiq.backend.model.Role;
import com.talentiq.backend.model.User;
import com.talentiq.backend.repository.JobRepository;
import com.talentiq.backend.repository.MatchRepository;
import com.talentiq.backend.repository.ResumeRepository;
import com.talentiq.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private MatchRepository matchRepository;

    // Get all users with pagination
    public PagedResponse<UserManagementResponse> getAllUsers(int page, int size, String sortBy, String sortDirection) {
        // Validate and set defaults
        if (page < 0) page = 0;
        if (size <= 0 || size > 100) size = 10;
        if (sortBy == null || sortBy.isEmpty()) sortBy = "createdAt";

        // Create sort and pageable
        Sort sort = sortDirection != null && sortDirection.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Get paginated users
        Page<User> userPage = userRepository.findAll(pageable);

        // Convert to UserManagementResponse DTOs
        List<UserManagementResponse> userResponses = userPage.getContent().stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                userResponses,
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.isLast(),
                userPage.isFirst()
        );
    }

    // Update user role
    public UserManagementResponse updateUserRole(Long userId, UpdateRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        user.setRole(request.getRole());
        user = userRepository.save(user);

        return convertToUserResponse(user);
    }

    // Delete user (with cascade cleanup)
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Clean up related data before deleting user
        // 1. Delete user's resumes
        List<Resume> userResumes = resumeRepository.findByUserId(userId);
        resumeRepository.deleteAll(userResumes);

        // 2. Delete jobs created by this user (if recruiter)
        List<Job> userJobs = jobRepository.findByRecruiterId(userId);
        jobRepository.deleteAll(userJobs);

        // 3. Now safe to delete the user
        userRepository.delete(user);
    }

    // Get all jobs (admin view) with pagination
    public PagedResponse<JobResponse> getAllJobsAdmin(int page, int size, String sortBy, String sortDirection) {
        // Validate and set defaults
        if (page < 0) page = 0;
        if (size <= 0 || size > 100) size = 10;
        if (sortBy == null || sortBy.isEmpty()) sortBy = "createdAt";

        // Create sort and pageable
        Sort sort = sortDirection != null && sortDirection.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Get paginated jobs
        Page<Job> jobPage = jobRepository.findAll(pageable);

        // Convert to JobResponse DTOs
        List<JobResponse> jobResponses = jobPage.getContent().stream()
                .map(this::convertToJobResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                jobResponses,
                jobPage.getNumber(),
                jobPage.getSize(),
                jobPage.getTotalElements(),
                jobPage.getTotalPages(),
                jobPage.isLast(),
                jobPage.isFirst()
        );
    }

    // Delete any job (admin override)
    public void deleteJobAdmin(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        jobRepository.delete(job);
    }

    // Get platform statistics
    public AdminStatsResponse getPlatformStats() {
        long totalUsers = userRepository.count();
        long totalJobSeekers = userRepository.countByRole(Role.JOB_SEEKER);
        long totalRecruiters = userRepository.countByRole(Role.RECRUITER);
        long totalAdmins = userRepository.countByRole(Role.ADMIN);
        long totalJobs = jobRepository.count();
        long totalResumes = resumeRepository.count();
        long totalMatches = matchRepository.count();

        return new AdminStatsResponse(
                totalUsers,
                totalJobSeekers,
                totalRecruiters,
                totalAdmins,
                totalJobs,
                totalResumes,
                totalMatches
        );
    }

    // Helper method to convert User to UserManagementResponse
    private UserManagementResponse convertToUserResponse(User user) {
        return new UserManagementResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }

    // Helper method to convert Job to JobResponse
    private JobResponse convertToJobResponse(Job job) {
        return new JobResponse(
                job.getId(),
                job.getTitle(),
                job.getDescription(),
                job.getCompany(),
                job.getSkillsRequired(),
                job.getExperienceLevel(),
                job.getRecruiter().getId(),
                job.getRecruiter().getFullName(),
                job.getCreatedAt(),
                job.getUpdatedAt()
        );
    }
}