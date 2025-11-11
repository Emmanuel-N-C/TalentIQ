package com.talentiq.backend.dto;

public class OAuthCheckResponse {
    private boolean exists;
    private String email;
    private String fullName;
    private String message;

    public OAuthCheckResponse() {
    }

    public OAuthCheckResponse(boolean exists, String email, String fullName, String message) {
        this.exists = exists;
        this.email = email;
        this.fullName = fullName;
        this.message = message;
    }

    // Getters and Setters
    public boolean isExists() {
        return exists;
    }

    public void setExists(boolean exists) {
        this.exists = exists;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}