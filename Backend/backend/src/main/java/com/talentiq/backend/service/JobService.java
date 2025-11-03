package com.talentiq.backend.service;

import com.talentiq.backend.dto.JobRequest;
import com.talentiq.backend.dto.JobResponse;
import com.talentiq.backend.dto.PagedResponse;
import com.talentiq.backend.model.Job;
import com.talentiq.backend.model.User;
import com.talentiq.backend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    public JobResponse createJob(JobRequest request, User recruiter) {
        Job job = new Job();
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCompany(request.getCompany());
        job.setSkillsRequired(request.getSkillsRequired());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setRecruiter(recruiter);

        job = jobRepository.save(job);
        return convertToResponse(job);
    }

    public List<JobResponse> getAllJobs() {
        return jobRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public PagedResponse<JobResponse> getAllJobsPaginated(int page, int size, String sortBy, String sortDirection) {
        // Validate and set defaults
        if (page < 0) page = 0;
        if (size <= 0 || size > 100) size = 10; // Max 100 items per page
        if (sortBy == null || sortBy.isEmpty()) sortBy = "createdAt";

        // Create sort object
        Sort sort = sortDirection != null && sortDirection.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        // Create pageable object
        Pageable pageable = PageRequest.of(page, size, sort);

        // Get paginated results
        Page<Job> jobPage = jobRepository.findAll(pageable);

        // Convert to JobResponse DTOs
        List<JobResponse> jobResponses = jobPage.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        // Create and return PagedResponse
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
    // Simple keyword search across multiple fields
    public PagedResponse<JobResponse> searchJobs(String keyword, int page, int size, String sortBy, String sortDirection) {
        // Validate and set defaults
        if (page < 0) page = 0;
        if (size <= 0 || size > 100) size = 10;
        if (sortBy == null || sortBy.isEmpty()) sortBy = "createdAt";

        // Create sort and pageable
        Sort sort = sortDirection != null && sortDirection.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Search by keyword
        Page<Job> jobPage = jobRepository.searchByKeyword(keyword, pageable);

        // Convert to JobResponse DTOs
        List<JobResponse> jobResponses = jobPage.getContent().stream()
                .map(this::convertToResponse)
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

    // Advanced search with multiple filters
    public PagedResponse<JobResponse> advancedSearchJobs(String title, String company, String skills,
                                                         String experienceLevel, int page, int size,
                                                         String sortBy, String sortDirection) {
        // Validate and set defaults
        if (page < 0) page = 0;
        if (size <= 0 || size > 100) size = 10;
        if (sortBy == null || sortBy.isEmpty()) sortBy = "createdAt";

        // Convert null or empty strings to empty string (not null) for proper query handling
        title = (title == null || title.trim().isEmpty()) ? "" : title.trim();
        company = (company == null || company.trim().isEmpty()) ? "" : company.trim();
        skills = (skills == null || skills.trim().isEmpty()) ? "" : skills.trim();
        experienceLevel = (experienceLevel == null || experienceLevel.trim().isEmpty()) ? "" : experienceLevel.trim();

        // Create sort and pageable
        Sort sort = sortDirection != null && sortDirection.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        // Perform advanced search
        Page<Job> jobPage = jobRepository.advancedSearch(title, company, skills, experienceLevel, pageable);

        // Convert to JobResponse DTOs
        List<JobResponse> jobResponses = jobPage.getContent().stream()
                .map(this::convertToResponse)
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

    public Job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + id));
    }

    public JobResponse getJobResponseById(Long id) {
        Job job = getJobById(id);
        return convertToResponse(job);
    }

    public JobResponse updateJob(Long id, JobRequest request, User recruiter) {
        Job job = getJobById(id);

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("You don't have permission to update this job");
        }

        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setCompany(request.getCompany());
        job.setSkillsRequired(request.getSkillsRequired());
        job.setExperienceLevel(request.getExperienceLevel());

        job = jobRepository.save(job);
        return convertToResponse(job);
    }

    public void deleteJob(Long id, User recruiter) {
        Job job = getJobById(id);

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("You don't have permission to delete this job");
        }

        jobRepository.delete(job);
    }

    // Helper method to convert Job entity to JobResponse DTO
    private JobResponse convertToResponse(Job job) {
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