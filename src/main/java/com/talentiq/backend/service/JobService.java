package com.talentiq.backend.service;

import com.talentiq.backend.dto.JobRequest;
import com.talentiq.backend.dto.JobResponse;
import com.talentiq.backend.model.Job;
import com.talentiq.backend.model.User;
import com.talentiq.backend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
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