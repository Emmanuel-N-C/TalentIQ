package com.talentiq.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.talentiq.backend.model.AuthProvider;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

@Service
public class OAuthService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OAuthUserInfo verifyGoogleToken(String token) {
        try {
            String url = "https://www.googleapis.com/oauth2/v3/userinfo";
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class
            );

            JsonNode jsonNode = objectMapper.readTree(response.getBody());

            return new OAuthUserInfo(
                    jsonNode.get("sub").asText(),
                    jsonNode.get("email").asText(),
                    jsonNode.get("name").asText(),
                    jsonNode.has("picture") ? jsonNode.get("picture").asText() : null,
                    AuthProvider.GOOGLE
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify Google token: " + e.getMessage());
        }
    }

    public OAuthUserInfo verifyGitHubToken(String token) {
        try {
            String url = "https://api.github.com/user";
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class
            );

            JsonNode jsonNode = objectMapper.readTree(response.getBody());

            // GitHub doesn't always provide email in user endpoint
            String email = jsonNode.has("email") && !jsonNode.get("email").isNull()
                    ? jsonNode.get("email").asText()
                    : fetchGitHubEmail(token);

            return new OAuthUserInfo(
                    jsonNode.get("id").asText(),
                    email,
                    jsonNode.get("name") != null ? jsonNode.get("name").asText() : jsonNode.get("login").asText(),
                    jsonNode.has("avatar_url") ? jsonNode.get("avatar_url").asText() : null,
                    AuthProvider.GITHUB
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to verify GitHub token: " + e.getMessage());
        }
    }

    private String fetchGitHubEmail(String token) {
        try {
            String url = "https://api.github.com/user/emails";
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class
            );

            JsonNode jsonNode = objectMapper.readTree(response.getBody());

            // Find primary verified email
            for (JsonNode emailNode : jsonNode) {
                if (emailNode.get("primary").asBoolean() && emailNode.get("verified").asBoolean()) {
                    return emailNode.get("email").asText();
                }
            }

            // If no primary, return first verified
            for (JsonNode emailNode : jsonNode) {
                if (emailNode.get("verified").asBoolean()) {
                    return emailNode.get("email").asText();
                }
            }

            throw new RuntimeException("No verified email found in GitHub account");
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch GitHub email: " + e.getMessage());
        }
    }

    public static class OAuthUserInfo {
        private String providerId;
        private String email;
        private String name;
        private String picture;
        private AuthProvider provider;

        public OAuthUserInfo(String providerId, String email, String name, String picture, AuthProvider provider) {
            this.providerId = providerId;
            this.email = email;
            this.name = name;
            this.picture = picture;
            this.provider = provider;
        }

        // Getters
        public String getProviderId() { return providerId; }
        public String getEmail() { return email; }
        public String getName() { return name; }
        public String getPicture() { return picture; }
        public AuthProvider getProvider() { return provider; }
    }
}