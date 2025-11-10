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
    @Query("SELECT a FROM Application a JOIN FETCH a.job j JOIN FETCH j.recruiter WHERE j.recruiter.id = :recruiterId ORDER BY a.appliedAt DESC")
    List<Application> findByRecruiterId(@Param("recruiterId") Long recruiterId);

    // Get applications for a specific job with a specific status
    List<Application> findByJobIdAndStatus(Long jobId, Application.ApplicationStatus status);

    // Check if recruiter has access to resume through applications (with resume relationship)
    // IMPROVED: Uses explicit JOIN to avoid lazy loading issues
    @Query("SELECT COUNT(a) > 0 FROM Application a JOIN a.resume r JOIN a.job j JOIN j.recruiter rec WHERE r.id = :resumeId AND rec.id = :recruiterId")
    boolean existsByResumeIdAndJobRecruiterId(@Param("resumeId") Long resumeId, @Param("recruiterId") Long recruiterId);

    // Check if user (resume owner) has applied to any of recruiter's jobs
    // IMPROVED: Uses explicit JOIN to avoid lazy loading issues
    @Query("SELECT COUNT(a) > 0 FROM Application a JOIN a.user u JOIN a.job j JOIN j.recruiter rec WHERE u.id = :userId AND rec.id = :recruiterId")
    boolean existsByUserIdAndJobRecruiterId(@Param("userId") Long userId, @Param("recruiterId") Long recruiterId);
}