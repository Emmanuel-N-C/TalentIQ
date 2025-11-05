package com.talentiq.backend.dto;

import java.util.Map;

public class JobStatsResponse {

    private Long jobId;
    private String jobTitle;
    private int totalApplications;
    private int pendingApplications;
    private int reviewingApplications;
    private int shortlistedApplications;
    private int interviewedApplications;
    private int acceptedApplications;
    private int rejectedApplications;
    private Map<String, Integer> applicationsByStatus;
    private int totalViews; // For future implementation

    public JobStatsResponse() {
    }

    public JobStatsResponse(Long jobId, String jobTitle, int totalApplications,
                            int pendingApplications, int reviewingApplications,
                            int shortlistedApplications, int interviewedApplications,
                            int acceptedApplications, int rejectedApplications,
                            Map<String, Integer> applicationsByStatus, int totalViews) {
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.totalApplications = totalApplications;
        this.pendingApplications = pendingApplications;
        this.reviewingApplications = reviewingApplications;
        this.shortlistedApplications = shortlistedApplications;
        this.interviewedApplications = interviewedApplications;
        this.acceptedApplications = acceptedApplications;
        this.rejectedApplications = rejectedApplications;
        this.applicationsByStatus = applicationsByStatus;
        this.totalViews = totalViews;
    }

    // Getters and Setters
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

    public int getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(int totalApplications) {
        this.totalApplications = totalApplications;
    }

    public int getPendingApplications() {
        return pendingApplications;
    }

    public void setPendingApplications(int pendingApplications) {
        this.pendingApplications = pendingApplications;
    }

    public int getReviewingApplications() {
        return reviewingApplications;
    }

    public void setReviewingApplications(int reviewingApplications) {
        this.reviewingApplications = reviewingApplications;
    }

    public int getShortlistedApplications() {
        return shortlistedApplications;
    }

    public void setShortlistedApplications(int shortlistedApplications) {
        this.shortlistedApplications = shortlistedApplications;
    }

    public int getInterviewedApplications() {
        return interviewedApplications;
    }

    public void setInterviewedApplications(int interviewedApplications) {
        this.interviewedApplications = interviewedApplications;
    }

    public int getAcceptedApplications() {
        return acceptedApplications;
    }

    public void setAcceptedApplications(int acceptedApplications) {
        this.acceptedApplications = acceptedApplications;
    }

    public int getRejectedApplications() {
        return rejectedApplications;
    }

    public void setRejectedApplications(int rejectedApplications) {
        this.rejectedApplications = rejectedApplications;
    }

    public Map<String, Integer> getApplicationsByStatus() {
        return applicationsByStatus;
    }

    public void setApplicationsByStatus(Map<String, Integer> applicationsByStatus) {
        this.applicationsByStatus = applicationsByStatus;
    }

    public int getTotalViews() {
        return totalViews;
    }

    public void setTotalViews(int totalViews) {
        this.totalViews = totalViews;
    }
}