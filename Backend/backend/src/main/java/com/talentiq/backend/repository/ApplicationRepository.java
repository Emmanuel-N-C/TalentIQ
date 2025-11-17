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

    // Find all applications for a specific job (for recruiters) - WITH EAGER LOADING
    @Query("SELECT a FROM Application a " +
            "JOIN FETCH a.job j " +
            "JOIN FETCH a.user u " +
            "JOIN FETCH a.resume r " +
            "WHERE j.id = :jobId " +
            "ORDER BY a.appliedAt DESC")
    List<Application> findByJobId(@Param("jobId") Long jobId);

    // Find all applications by a specific user (for jobseekers) - WITH EAGER LOADING
    @Query("SELECT a FROM Application a " +
            "JOIN FETCH a.job j " +
            "JOIN FETCH j.recruiter rec " +
            "JOIN FETCH a.resume r " +
            "WHERE a.user.id = :userId " +
            "ORDER BY a.appliedAt DESC")
    List<Application> findByUserIdOrderByAppliedAtDesc(@Param("userId") Long userId);

    // ADDED: Find all applications by user (without ordering) - needed by AdminService and ResumeService
    @Query("SELECT a FROM Application a " +
            "JOIN FETCH a.job j " +
            "JOIN FETCH a.user u " +
            "JOIN FETCH a.resume r " +
            "WHERE a.user.id = :userId")
    List<Application> findByUserId(@Param("userId") Long userId);

    // Check if user already applied to a job
    Optional<Application> findByJobIdAndUserId(Long jobId, Long userId);

    // Count applications for a specific job
    long countByJobId(Long jobId);

    // Count applications by status for a specific job
    long countByJobIdAndStatus(Long jobId, Application.ApplicationStatus status);

    // Find all applications for jobs posted by a specific recruiter - WITH EAGER LOADING
    @Query("SELECT a FROM Application a " +
            "JOIN FETCH a.job j " +
            "JOIN FETCH a.user u " +
            "JOIN FETCH a.resume r " +
            "JOIN FETCH j.recruiter rec " +
            "WHERE rec.id = :recruiterId " +
            "ORDER BY a.appliedAt DESC")
    List<Application> findByRecruiterId(@Param("recruiterId") Long recruiterId);

    // Get applications for a specific job with a specific status
    @Query("SELECT a FROM Application a " +
            "JOIN FETCH a.job j " +
            "JOIN FETCH a.user u " +
            "JOIN FETCH a.resume r " +
            "WHERE j.id = :jobId AND a.status = :status " +
            "ORDER BY a.appliedAt DESC")
    List<Application> findByJobIdAndStatus(@Param("jobId") Long jobId, @Param("status") Application.ApplicationStatus status);

    // Check if recruiter has access to resume through applications
    @Query("SELECT COUNT(a) > 0 FROM Application a " +
            "JOIN a.resume r " +
            "JOIN a.job j " +
            "JOIN j.recruiter rec " +
            "WHERE r.id = :resumeId AND rec.id = :recruiterId")
    boolean existsByResumeIdAndJobRecruiterId(@Param("resumeId") Long resumeId, @Param("recruiterId") Long recruiterId);

    // Check if user has applied to any of recruiter's jobs
    @Query("SELECT COUNT(a) > 0 FROM Application a " +
            "JOIN a.user u " +
            "JOIN a.job j " +
            "JOIN j.recruiter rec " +
            "WHERE u.id = :userId AND rec.id = :recruiterId")
    boolean existsByUserIdAndJobRecruiterId(@Param("userId") Long userId, @Param("recruiterId") Long recruiterId);
}