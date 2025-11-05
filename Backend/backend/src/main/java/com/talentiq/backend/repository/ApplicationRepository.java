package com.talentiq.backend.repository;

import com.talentiq.backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    // Find all applications for a specific job (for recruiters)
    List<Application> findByJobId(Long jobId);

    // Find all applications by a specific user (for jobseekers)
    List<Application> findByUserId(Long userId);

    // Find all applications by user ordered by most recent
    List<Application> findByUserIdOrderByAppliedAtDesc(Long userId);

    // Check if user already applied to a job
    Optional<Application> findByJobIdAndUserId(Long jobId, Long userId);

    // Count applications for a specific job
    long countByJobId(Long jobId);

    // Count applications by status for a specific job
    long countByJobIdAndStatus(Long jobId, Application.ApplicationStatus status);

    // Find all applications for jobs posted by a specific recruiter
    @Query("SELECT a FROM Application a WHERE a.job.recruiter.id = :recruiterId ORDER BY a.appliedAt DESC")
    List<Application> findByRecruiterId(@Param("recruiterId") Long recruiterId);

    // Get applications for a specific job with a specific status
    List<Application> findByJobIdAndStatus(Long jobId, Application.ApplicationStatus status);
}