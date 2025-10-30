package com.talentiq.backend.dto;

import jakarta.validation.constraints.NotNull;

public class MatchRequest {

    @NotNull(message = "Resume ID is required")
    private Long resumeId;

    @NotNull(message = "Job ID is required")
    private Long jobId;

    @NotNull(message = "Match score is required")
    private Double matchScore;

    private String analysisResult;

    public MatchRequest() {
    }

    public MatchRequest(Long resumeId, Long jobId, Double matchScore, String analysisResult) {
        this.resumeId = resumeId;
        this.jobId = jobId;
        this.matchScore = matchScore;
        this.analysisResult = analysisResult;
    }

    // Getters and Setters
    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public Double getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(Double matchScore) {
        this.matchScore = matchScore;
    }

    public String getAnalysisResult() {
        return analysisResult;
    }

    public void setAnalysisResult(String analysisResult) {
        this.analysisResult = analysisResult;
    }
}