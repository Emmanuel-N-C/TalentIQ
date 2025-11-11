package com.talentiq.backend.controller;

import com.talentiq.backend.dto.*;
import com.talentiq.backend.model.User;
import com.talentiq.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;

    /**
     * Register new user (sends OTP)
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * Verify OTP and activate account
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    /**
     * Resend OTP
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        return ResponseEntity.ok(authService.resendOtp(request));
    }

    /**
     * Login with email/password
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Check if OAuth user exists (for login/register flow)
     */
    @PostMapping("/oauth/check")
    public ResponseEntity<OAuthCheckResponse> checkOAuthUser(@Valid @RequestBody OAuthCheckRequest request) {
        return ResponseEntity.ok(authService.checkOAuthUser(request));
    }

    /**
     * OAuth Registration (new users)
     */
    @PostMapping("/oauth/register")
    public ResponseEntity<AuthResponse> oauthRegister(@Valid @RequestBody OAuthLoginRequest request) {
        return ResponseEntity.ok(authService.oauthRegister(request));
    }

    /**
     * OAuth Login (existing users)
     */
    @PostMapping("/oauth/login")
    public ResponseEntity<AuthResponse> oauthLogin(@Valid @RequestBody OAuthCheckRequest request) {
        return ResponseEntity.ok(authService.oauthLoginExisting(request));
    }

    /**
     * Forgot Password (send reset link)
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    /**
     * Reset Password with token
     */
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }

    /**
     * Change Password (authenticated users)
     */
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.changePassword(request, user));
    }
}