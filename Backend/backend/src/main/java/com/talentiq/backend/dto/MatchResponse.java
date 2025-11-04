package com.talentiq.backend.dto;

import java.time.LocalDateTime;

public class MatchResponse {
    private Long id;
    private Long resumeId;
    private String resumeFilename;
    private Long jobId;
    private String jobTitle;
    private String jobCompany;
    private Double matchScore;
    private String analysisResult;
    private LocalDateTime createdAt;

    public MatchResponse() {
    }

    public MatchResponse(Long id, Long resumeId, String resumeFilename,
                         Long jobId, String jobTitle, String jobCompany,
                         Double matchScore, String analysisResult, LocalDateTime createdAt) {
        this.id = id;
        this.resumeId = resumeId;
        this.resumeFilename = resumeFilename;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.jobCompany = jobCompany;
        this.matchScore = matchScore;
        this.analysisResult = analysisResult;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getResumeId() {
        return resumeId;
    }

    public void setResumeId(Long resumeId) {
        this.resumeId = resumeId;
    }

    public String getResumeFilename() {
        return resumeFilename;
    }

    public void setResumeFilename(String resumeFilename) {
        this.resumeFilename = resumeFilename;
    }

    public Long getJobId() {
        return jobId;
    }

    public void setJobId(Long jobId) {
        this.jobId = jobId;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getJobCompany() {
        return jobCompany;
    }

    public void setJobCompany(String jobCompany) {
        this.jobCompany = jobCompany;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}