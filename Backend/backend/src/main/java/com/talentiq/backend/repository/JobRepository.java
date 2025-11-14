package com.talentiq.backend.repository;

import com.talentiq.backend.model.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    // ========== NEW: EAGER FETCH QUERIES (FIX FOR LAZY LOADING) ==========

    @Query("SELECT j FROM Job j JOIN FETCH j.recruiter")
    List<Job> findAllWithRecruiter();

    @Query("SELECT DISTINCT j FROM Job j JOIN FETCH j.recruiter")
    Page<Job> findAllWithRecruiter(Pageable pageable);

    @Query("SELECT j FROM Job j JOIN FETCH j.recruiter WHERE j.id = :id")
    Optional<Job> findByIdWithRecruiter(@Param("id") Long id);

    @Query("SELECT j FROM Job j JOIN FETCH j.recruiter WHERE j.recruiter.id = :recruiterId")
    List<Job> findByRecruiterIdWithRecruiter(@Param("recruiterId") Long recruiterId);

    // ========== EXISTING METHODS ==========

    List<Job> findByRecruiterId(Long recruiterId);

    // Search by title (case-insensitive, partial match)
    Page<Job> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    // Search by company (case-insensitive, partial match)
    Page<Job> findByCompanyContainingIgnoreCase(String company, Pageable pageable);

    // Search by experience level (exact match, case-insensitive)
    Page<Job> findByExperienceLevelIgnoreCase(String experienceLevel, Pageable pageable);

    // Search by skills (case-insensitive, partial match)
    Page<Job> findBySkillsRequiredContainingIgnoreCase(String skills, Pageable pageable);

    // Combined search - title OR company OR skills (WITH EAGER FETCH)
    @Query("SELECT DISTINCT j FROM Job j JOIN FETCH j.recruiter WHERE " +
            "LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(j.company) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(j.skillsRequired) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Job> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Advanced search with multiple criteria (WITH EAGER FETCH)
    @Query("SELECT DISTINCT j FROM Job j JOIN FETCH j.recruiter WHERE " +
            "(:title IS NULL OR :title = '' OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
            "(:company IS NULL OR :company = '' OR LOWER(j.company) LIKE LOWER(CONCAT('%', :company, '%'))) AND " +
            "(:skills IS NULL OR :skills = '' OR LOWER(j.skillsRequired) LIKE LOWER(CONCAT('%', :skills, '%'))) AND " +
            "(:experienceLevel IS NULL OR :experienceLevel = '' OR LOWER(j.experienceLevel) = LOWER(:experienceLevel))")
    Page<Job> advancedSearch(
            @Param("title") String title,
            @Param("company") String company,
            @Param("skills") String skills,
            @Param("experienceLevel") String experienceLevel,
            Pageable pageable
    );
}