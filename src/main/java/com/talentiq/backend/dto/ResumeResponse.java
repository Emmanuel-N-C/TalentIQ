package com.talentiq.backend.dto;

import java.time.LocalDateTime;

public class ResumeResponse {
    private Long id;
    private String filename;
    private LocalDateTime uploadedAt;
    private Long userId;

    public ResumeResponse() {
    }

    public ResumeResponse(Long id, String filename, LocalDateTime uploadedAt, Long userId) {
        this.id = id;
        this.filename = filename;
        this.uploadedAt = uploadedAt;
        this.userId = userId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}