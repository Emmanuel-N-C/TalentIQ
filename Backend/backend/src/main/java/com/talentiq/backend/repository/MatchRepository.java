package com.talentiq.backend.repository;

import com.talentiq.backend.model.Match;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {

    List<Match> findByResumeUserId(Long userId);

    List<Match> findByResumeUserIdOrderByIdDesc(Long userId);
}