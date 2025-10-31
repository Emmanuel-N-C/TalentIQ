package com.talentiq.backend.dto;

public class AdminStatsResponse {
    private long totalUsers;
    private long totalJobSeekers;
    private long totalRecruiters;
    private long totalAdmins;
    private long totalJobs;
    private long totalResumes;
    private long totalMatches;

    public AdminStatsResponse() {
    }

    public AdminStatsResponse(long totalUsers, long totalJobSeekers, long totalRecruiters,
                              long totalAdmins, long totalJobs, long totalResumes, long totalMatches) {
        this.totalUsers = totalUsers;
        this.totalJobSeekers = totalJobSeekers;
        this.totalRecruiters = totalRecruiters;
        this.totalAdmins = totalAdmins;
        this.totalJobs = totalJobs;
        this.totalResumes = totalResumes;
        this.totalMatches = totalMatches;
    }

    // Getters and Setters
    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalJobSeekers() {
        return totalJobSeekers;
    }

    public void setTotalJobSeekers(long totalJobSeekers) {
        this.totalJobSeekers = totalJobSeekers;
    }

    public long getTotalRecruiters() {
        return totalRecruiters;
    }

    public void setTotalRecruiters(long totalRecruiters) {
        this.totalRecruiters = totalRecruiters;
    }

    public long getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public long getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(long totalJobs) {
        this.totalJobs = totalJobs;
    }

    public long getTotalResumes() {
        return totalResumes;
    }

    public void setTotalResumes(long totalResumes) {
        this.totalResumes = totalResumes;
    }

    public long getTotalMatches() {
        return totalMatches;
    }

    public void setTotalMatches(long totalMatches) {
        this.totalMatches = totalMatches;
    }
}