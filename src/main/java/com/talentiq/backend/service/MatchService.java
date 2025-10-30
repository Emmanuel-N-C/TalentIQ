package com.talentiq.backend.service;

import com.talentiq.backend.dto.MatchRequest;
import com.talentiq.backend.model.Job;
import com.talentiq.backend.model.Match;
import com.talentiq.backend.model.Resume;
import com.talentiq.backend.repository.JobRepository;
import com.talentiq.backend.repository.MatchRepository;
import com.talentiq.backend.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class MatchService {

    @Autowired
    private MatchRepository matchRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private JobRepository jobRepository;

    public Match saveMatch(MatchRequest request) {
        Resume resume = resumeRepository.findById(request.getResumeId())
                .orElseThrow(() -> new RuntimeException("Resume not found"));

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

        Match match = new Match();
        match.setResume(resume);
        match.setJob(job);
        match.setMatchScore(request.getMatchScore());
        match.setAnalysisResult(request.getAnalysisResult());

        return matchRepository.save(match);
    }
}