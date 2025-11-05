package com.talentiq.backend.service;

import com.talentiq.backend.dto.ApplicationRequest;
import com.talentiq.backend.dto.ApplicationResponse;
import com.talentiq.backend.dto.JobStatsResponse;
import com.talentiq.backend.model.Application;
import com.talentiq.backend.model.Job;
import com.talentiq.backend.model.Resume;
import com.talentiq.backend.model.User;
import com.talentiq.backend.repository.ApplicationRepository;
import com.talentiq.backend.repository.JobRepository;
import com.talentiq.backend.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Transactional
    public ApplicationResponse createApplication(ApplicationRequest request, User user) {
        // Verify job exists
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + request.getJobId()));

        // Verify resume exists and belongs to user
        Resume resume = resumeRepository.findById(request.getResumeId())
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + request.getResumeId()));

        if (!resume.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You don't have permission to use this resume");
        }

        // Check if user already applied
        if (applicationRepository.findByJobIdAndUserId(job.getId(), user.getId()).isPresent()) {
            throw new RuntimeException("You have already applied to this job");
        }

        // Prevent recruiters from applying to their own jobs
        if (job.getRecruiter().getId().equals(user.getId())) {
            throw new RuntimeException("You cannot apply to your own job posting");
        }

        // Create application
        Application application = new Application();
        application.setJob(job);
        application.setUser(user);
        application.setResume(resume);
        application.setCoverLetter(request.getCoverLetter());
        application.setStatus(Application.ApplicationStatus.PENDING);

        application = applicationRepository.save(application);

        System.out.println("✅ Application created: User " + user.getEmail() + " applied to job " + job.getTitle());

        return convertToResponse(application);
    }

    public List<ApplicationResponse> getApplicationsForJob(Long jobId, User recruiter) {
        // Verify job exists and belongs to recruiter
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("You don't have permission to view applications for this job");
        }

        List<Application> applications = applicationRepository.findByJobId(jobId);
        return applications.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getUserApplications(User user) {
        List<Application> applications = applicationRepository.findByUserIdOrderByAppliedAtDesc(user.getId());
        return applications.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponse> getAllRecruiterApplications(User recruiter) {
        List<Application> applications = applicationRepository.findByRecruiterId(recruiter.getId());
        return applications.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse updateApplicationStatus(Long applicationId, Application.ApplicationStatus newStatus,
                                                       String recruiterNotes, User recruiter) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));

        // Verify recruiter owns the job
        if (!application.getJob().getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("You don't have permission to update this application");
        }

        application.setStatus(newStatus);
        application.setReviewedAt(LocalDateTime.now());
        if (recruiterNotes != null) {
            application.setRecruiterNotes(recruiterNotes);
        }

        application = applicationRepository.save(application);

        System.out.println("✅ Application " + applicationId + " status updated to " + newStatus);

        return convertToResponse(application);
    }

    public JobStatsResponse getJobStats(Long jobId, User recruiter) {
        // Verify job exists and belongs to recruiter
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        if (!job.getRecruiter().getId().equals(recruiter.getId())) {
            throw new RuntimeException("You don't have permission to view stats for this job");
        }

        List<Application> applications = applicationRepository.findByJobId(jobId);

        int totalApplications = applications.size();
        int pending = (int) applications.stream().filter(a -> a.getStatus() == Application.ApplicationStatus.PENDING).count();
        int reviewing = (int) applications.stream().filter(a -> a.getStatus() == Application.ApplicationStatus.REVIEWING).count();
        int shortlisted = (int) applications.stream().filter(a -> a.getStatus() == Application.ApplicationStatus.SHORTLISTED).count();
        int interviewed = (int) applications.stream().filter(a -> a.getStatus() == Application.ApplicationStatus.INTERVIEWED).count();
        int accepted = (int) applications.stream().filter(a -> a.getStatus() == Application.ApplicationStatus.ACCEPTED).count();
        int rejected = (int) applications.stream().filter(a -> a.getStatus() == Application.ApplicationStatus.REJECTED).count();

        Map<String, Integer> statusMap = new HashMap<>();
        statusMap.put("PENDING", pending);
        statusMap.put("REVIEWING", reviewing);
        statusMap.put("SHORTLISTED", shortlisted);
        statusMap.put("INTERVIEWED", interviewed);
        statusMap.put("ACCEPTED", accepted);
        statusMap.put("REJECTED", rejected);

        return new JobStatsResponse(
                jobId,
                job.getTitle(),
                totalApplications,
                pending,
                reviewing,
                shortlisted,
                interviewed,
                accepted,
                rejected,
                statusMap,
                0 // Views - not implemented yet
        );
    }

    public long getApplicationCountForJob(Long jobId) {
        return applicationRepository.countByJobId(jobId);
    }

    private ApplicationResponse convertToResponse(Application application) {
        return new ApplicationResponse(
                application.getId(),
                application.getJob().getId(),
                application.getJob().getTitle(),
                application.getJob().getCompany(),
                application.getUser().getId(),
                application.getUser().getFullName(),
                application.getUser().getEmail(),
                application.getResume().getId(),
                application.getResume().getFilename(),
                application.getCoverLetter(),
                application.getStatus(),
                application.getAppliedAt(),
                application.getReviewedAt(),
                application.getRecruiterNotes()
        );
    }
}