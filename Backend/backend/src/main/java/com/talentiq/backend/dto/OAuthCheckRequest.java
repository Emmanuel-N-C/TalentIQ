package com.talentiq.backend.dto;

import com.talentiq.backend.model.AuthProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class OAuthCheckRequest {

    @NotBlank(message = "Token is required")
    private String token;

    @NotNull(message = "Provider is required")
    private AuthProvider provider;

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public AuthProvider getProvider() {
        return provider;
    }

    public void setProvider(AuthProvider provider) {
        this.provider = provider;
    }
}