package com.talentiq.backend.dto;

import com.talentiq.backend.model.AuthProvider;
import com.talentiq.backend.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class OAuthLoginRequest {

    @NotBlank(message = "Token is required")
    private String token; // OAuth token from provider

    @NotNull(message = "Provider is required")
    private AuthProvider provider;

    @NotNull(message = "Role is required")
    private Role role; // User must select role on first OAuth login

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

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}