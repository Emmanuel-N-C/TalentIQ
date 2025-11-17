package com.talentiq.backend.repository;

import com.talentiq.backend.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    // FIXED: Add JOIN FETCH to eagerly load relationships (prevents LazyInitializationException in production)
    @Query("SELECT m FROM Match m " +
            "JOIN FETCH m.resume r " +
            "JOIN FETCH m.job j " +
            "JOIN FETCH j.recruiter rec " +
            "WHERE r.user.id = :userId")
    List<Match> findByResumeUserId(@Param("userId") Long userId);

    // FIXED: Add JOIN FETCH with ORDER BY for saved jobs listing
    @Query("SELECT m FROM Match m " +
            "JOIN FETCH m.resume r " +
            "JOIN FETCH m.job j " +
            "JOIN FETCH j.recruiter rec " +
            "WHERE r.user.id = :userId " +
            "ORDER BY m.id DESC")
    List<Match> findByResumeUserIdOrderByIdDesc(@Param("userId") Long userId);

    // FIXED: Add method to find match by ID with eager loading (for delete operation)
    @Query("SELECT m FROM Match m " +
            "JOIN FETCH m.resume r " +
            "JOIN FETCH m.job j " +
            "WHERE m.id = :matchId")
    Optional<Match> findByIdWithRelations(@Param("matchId") Long matchId);

    // FIXED: Find all matches for a specific job (WITH EAGER LOADING)
    @Query("SELECT m FROM Match m " +
            "JOIN FETCH m.resume r " +
            "JOIN FETCH m.job j " +
            "WHERE j.id = :jobId")
    List<Match> findByJobId(@Param("jobId") Long jobId);
}