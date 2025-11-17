package com.talentiq.backend.service;

import com.talentiq.backend.dto.MatchRequest;
import com.talentiq.backend.dto.MatchResponse;
import com.talentiq.backend.model.Job;
import com.talentiq.backend.model.Match;
import com.talentiq.backend.model.Resume;
import com.talentiq.backend.model.User;
import com.talentiq.backend.repository.JobRepository;
import com.talentiq.backend.repository.MatchRepository;
import com.talentiq.backend.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MatchService {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private JobRepository jobRepository;

    /**
     * Save a match (save a job for later)
     */
    @Transactional
    public MatchResponse saveMatch(MatchRequest request, User user) {
        System.out.println("📝 Saving match for user: " + user.getEmail());
        System.out.println("Resume ID: " + request.getResumeId());
        System.out.println("Job ID: " + request.getJobId());
        System.out.println("Match Score: " + request.getMatchScore());

        // Verify resume exists and belongs to user
        Resume resume = resumeRepository.findById(request.getResumeId())
                .orElseThrow(() -> new RuntimeException("Resume not found with id: " + request.getResumeId()));

        if (!resume.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only save matches for your own resumes");
        }

        // FIXED: Use findByIdWithRecruiter to eagerly load recruiter relationship
        Job job = jobRepository.findByIdWithRecruiter(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found with id: " + request.getJobId()));

        // Check if match already exists (now uses JOIN FETCH query)
        List<Match> existingMatches = matchRepository.findByResumeUserIdOrderByIdDesc(user.getId());
        for (Match existing : existingMatches) {
            if (existing.getJob().getId().equals(job.getId()) &&
                    existing.getResume().getId().equals(resume.getId())) {
                System.out.println("⚠️ Match already exists, returning existing match");
                return convertToResponse(existing);
            }
        }

        // Create new match
        Match match = new Match();
        match.setResume(resume);
        match.setJob(job);
        match.setMatchScore(request.getMatchScore());
        match.setAnalysisResult(request.getAnalysisResult());

        Match savedMatch = matchRepository.save(match);
        System.out.println("✅ Match saved successfully with ID: " + savedMatch.getId());

        return convertToResponse(savedMatch);
    }

    /**
     * Get all saved jobs for a user
     * FIXED: Now uses JOIN FETCH query to prevent LazyInitializationException
     */
    public List<MatchResponse> getUserMatches(User user) {
        // Uses findByResumeUserIdOrderByIdDesc which now has JOIN FETCH
        List<Match> matches = matchRepository.findByResumeUserIdOrderByIdDesc(user.getId());
        return matches.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Delete a saved job
     * FIXED: Use findByIdWithRelations to eagerly load relationships
     */
    @Transactional
    public void deleteMatch(Long matchId, User user) {
        System.out.println("🗑️ Deleting match ID: " + matchId + " for user: " + user.getEmail());

        // FIXED: Use eager-loading method instead of findById
        Match match = matchRepository.findByIdWithRelations(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found with id: " + matchId));

        // Verify match belongs to user (check through resume ownership)
        if (!match.getResume().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: You can only delete your own saved jobs");
        }

        matchRepository.delete(match);
        System.out.println("✅ Match deleted successfully");
    }

    /**
     * Convert Match entity to MatchResponse DTO
     */
    private MatchResponse convertToResponse(Match match) {
        return new MatchResponse(
                match.getId(),
                match.getResume().getId(),
                match.getResume().getFilename(),
                match.getJob().getId(),
                match.getJob().getTitle(),
                match.getJob().getCompany(),
                match.getMatchScore(),
                match.getAnalysisResult(),
                match.getCreatedAt()
        );
    }
}