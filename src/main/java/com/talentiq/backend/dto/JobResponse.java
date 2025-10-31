package com.talentiq.backend.dto;

import java.time.LocalDateTime;

public class JobResponse {
    private Long id;
    private String title;
    private String description;
    private String company;
    private String skillsRequired;
    private String experienceLevel;
    private Long recruiterId;
    private String recruiterName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public JobResponse() {
    }

    public JobResponse(Long id, String title, String description, String company,
                       String skillsRequired, String experienceLevel,
                       Long recruiterId, String recruiterName,
                       LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.company = company;
        this.skillsRequired = skillsRequired;
        this.experienceLevel = experienceLevel;
        this.recruiterId = recruiterId;
        this.recruiterName = recruiterName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getSkillsRequired() {
        return skillsRequired;
    }

    public void setSkillsRequired(String skillsRequired) {
        this.skillsRequired = skillsRequired;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public Long getRecruiterId() {
        return recruiterId;
    }

    public void setRecruiterId(Long recruiterId) {
        this.recruiterId = recruiterId;
    }

    public String getRecruiterName() {
        return recruiterName;
    }

    public void setRecruiterName(String recruiterName) {
        this.recruiterName = recruiterName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}