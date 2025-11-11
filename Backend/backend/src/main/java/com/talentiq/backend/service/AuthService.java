package com.talentiq.backend.service;

import com.talentiq.backend.dto.*;
import com.talentiq.backend.model.AuthProvider;
import com.talentiq.backend.model.User;
import com.talentiq.backend.repository.UserRepository;
import com.talentiq.backend.security.JwtTokenProvider;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.talentiq.backend.exception.EmailNotVerifiedException;
import com.talentiq.backend.dto.OAuthCheckRequest;
import com.talentiq.backend.dto.OAuthCheckResponse;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private EmailService emailService;

    @Autowired
    private OtpService otpService;

    @Autowired
    private EmailValidationService emailValidationService;

    @Autowired
    private OAuthService oAuthService;

    private static final int MAX_FAILED_ATTEMPTS = 5;

    /**
     * Register new user with OTP verification
     */
    @Transactional
    public Map<String, String> register(RegisterRequest request) {
        // Validate email format
        if (!emailValidationService.isValidEmailFormat(request.getEmail())) {
            throw new RuntimeException("Invalid email format");
        }

        // Validate email domain MX records
        if (!emailValidationService.hasValidMXRecords(request.getEmail())) {
            throw new RuntimeException("Invalid or unreachable email domain");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Create user (not verified yet)
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(request.getRole());
        user.setEmailVerified(false);
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setAccountLocked(false);
        user.setFailedLoginAttempts(0);

        userRepository.save(user);

        // Generate and send OTP
        String otp = otpService.generateOtp(user.getEmail());
        emailService.sendOtpEmail(user.getEmail(), otp, user.getFullName());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Registration successful. Please check your email for OTP.");
        response.put("email", user.getEmail());

        return response;
    }

    /**
     * Verify OTP and activate account
     */
    @Transactional
    public AuthResponse verifyOtp(VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }

        if (!otpService.validateOtp(request.getEmail(), request.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        // Verify email
        user.setEmailVerified(true);
        userRepository.save(user);

        // Send welcome email
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        // Generate JWT token
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user, null, user.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name(), user.getAuthProvider().name());
    }

    /**
     * Resend OTP
     */
    public Map<String, String> resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }

        // Generate and send new OTP
        String otp = otpService.generateOtp(user.getEmail());
        emailService.sendOtpEmail(user.getEmail(), otp, user.getFullName());

        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP resent successfully");

        return response;
    }

    /**
     * Login with email/password
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        // Check if account is locked
        if (user.getAccountLocked()) {
            throw new LockedException("Account is locked due to too many failed login attempts");
        }

        // Check if email is verified
        if (!user.getEmailVerified()) {
            throw new EmailNotVerifiedException(
                    "Email not verified. Please verify your email first.",
                    user.getEmail()
            );
        }

        // Check if OAuth user
        if (user.getAuthProvider() != AuthProvider.LOCAL) {
            throw new RuntimeException("Please login with " + user.getAuthProvider().name());
        }

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            // Reset failed attempts on successful login
            user.setFailedLoginAttempts(0);
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = tokenProvider.generateToken(authentication);

            return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name(), user.getAuthProvider().name());
        } catch (BadCredentialsException e) {
            // Increment failed attempts
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);

            if (user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS) {
                user.setAccountLocked(true);
                userRepository.save(user);
                throw new LockedException("Account locked due to too many failed attempts");
            }

            userRepository.save(user);
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    /**
     * OAuth Login (Google/GitHub)
     */
    @Transactional
    public AuthResponse oauthLogin(OAuthLoginRequest request) {
        // Verify token with provider
        OAuthService.OAuthUserInfo oauthUser;

        if (request.getProvider() == AuthProvider.GOOGLE) {
            oauthUser = oAuthService.verifyGoogleToken(request.getToken());
        } else if (request.getProvider() == AuthProvider.GITHUB) {
            oauthUser = oAuthService.verifyGitHubToken(request.getToken());
        } else {
            throw new RuntimeException("Unsupported OAuth provider");
        }

        // Check if user exists
        User user = userRepository.findByEmail(oauthUser.getEmail()).orElse(null);

        if (user == null) {
            // Create new user with placeholder password
            user = new User();
            user.setEmail(oauthUser.getEmail());
            // Set random UUID as password for OAuth users (required by DB schema)
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setFullName(oauthUser.getName() != null && !oauthUser.getName().isBlank()
                    ? oauthUser.getName()
                    : "User");  // Fallback if name is missing
            user.setRole(request.getRole());
            user.setAuthProvider(request.getProvider());
            user.setProviderId(oauthUser.getProviderId());
            user.setEmailVerified(true); // OAuth emails are pre-verified
            user.setAccountLocked(false);
            user.setFailedLoginAttempts(0);

            user = userRepository.save(user);
        } else {
            // Existing user - verify they're using same provider
            if (user.getAuthProvider() != request.getProvider()) {
                throw new RuntimeException("Email already registered with " + user.getAuthProvider().name());
            }

            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
        }

        // Generate JWT
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user, null, user.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name(), user.getAuthProvider().name());
    }

    /**
     * Check if OAuth user exists (for login/register flow)
     */
    public OAuthCheckResponse checkOAuthUser(OAuthCheckRequest request) {
        // Verify token with provider
        OAuthService.OAuthUserInfo oauthUser;

        if (request.getProvider() == AuthProvider.GOOGLE) {
            oauthUser = oAuthService.verifyGoogleToken(request.getToken());
        } else if (request.getProvider() == AuthProvider.GITHUB) {
            oauthUser = oAuthService.verifyGitHubToken(request.getToken());
        } else {
            throw new RuntimeException("Unsupported OAuth provider");
        }

        // Check if user exists
        User user = userRepository.findByEmail(oauthUser.getEmail()).orElse(null);

        if (user != null) {
            // User exists
            return new OAuthCheckResponse(
                    true,
                    user.getEmail(),
                    user.getFullName(),
                    "User account found"
            );
        } else {
            // New user
            return new OAuthCheckResponse(
                    false,
                    oauthUser.getEmail(),
                    oauthUser.getName() != null && !oauthUser.getName().isBlank() ? oauthUser.getName() : "",
                    "No account found. Please complete registration."
            );
        }
    }

    /**
     * OAuth Registration (for new OAuth users)
     */
    @Transactional
    public AuthResponse oauthRegister(OAuthLoginRequest request) {
        // Verify token with provider
        OAuthService.OAuthUserInfo oauthUser;

        if (request.getProvider() == AuthProvider.GOOGLE) {
            oauthUser = oAuthService.verifyGoogleToken(request.getToken());
        } else if (request.getProvider() == AuthProvider.GITHUB) {
            oauthUser = oAuthService.verifyGitHubToken(request.getToken());
        } else {
            throw new RuntimeException("Unsupported OAuth provider");
        }

        // Check if user already exists
        if (userRepository.existsByEmail(oauthUser.getEmail())) {
            throw new RuntimeException("User already exists. Please use login instead.");
        }

        // Create new user with placeholder password
        User user = new User();
        user.setEmail(oauthUser.getEmail());
        // Set random UUID as password for OAuth users (required by DB schema)
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setFullName(oauthUser.getName() != null && !oauthUser.getName().isBlank()
                ? oauthUser.getName()
                : "User");  // Fallback if name is missing
        user.setRole(request.getRole());
        user.setAuthProvider(request.getProvider());
        user.setProviderId(oauthUser.getProviderId());
        user.setEmailVerified(true); // OAuth emails are pre-verified
        user.setAccountLocked(false);
        user.setFailedLoginAttempts(0);

        user = userRepository.save(user);

        // Generate JWT
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user, null, user.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name(), user.getAuthProvider().name());
    }

    /**
     * OAuth Login (for existing OAuth users only)
     */
    @Transactional
    public AuthResponse oauthLoginExisting(OAuthCheckRequest request) {
        // Verify token with provider
        OAuthService.OAuthUserInfo oauthUser;

        if (request.getProvider() == AuthProvider.GOOGLE) {
            oauthUser = oAuthService.verifyGoogleToken(request.getToken());
        } else if (request.getProvider() == AuthProvider.GITHUB) {
            oauthUser = oAuthService.verifyGitHubToken(request.getToken());
        } else {
            throw new RuntimeException("Unsupported OAuth provider");
        }

        // Find user
        User user = userRepository.findByEmail(oauthUser.getEmail())
                .orElseThrow(() -> new RuntimeException("No account found with this email. Please sign up first."));

        // Verify they're using same provider
        if (user.getAuthProvider() != request.getProvider()) {
            throw new RuntimeException("This email is registered with " + user.getAuthProvider().name() + ". Please use that method to log in.");
        }

        // Update last login
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        // Generate JWT
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                user, null, user.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name(), user.getAuthProvider().name());
    }

    /**
     * Forgot Password - send reset link
     */
    @Transactional
    public Map<String, String> forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with this email"));

        // Check if OAuth user
        if (user.getAuthProvider() != AuthProvider.LOCAL) {
            throw new RuntimeException("Password reset not available for " + user.getAuthProvider().name() + " accounts");
        }

        // Generate reset token
        String resetToken = RandomStringUtils.randomAlphanumeric(64);
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        // Send reset email
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken, user.getFullName());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset link sent to your email");

        return response;
    }

    /**
     * Reset Password with token
     */
    @Transactional
    public Map<String, String> resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        // Check token expiry
        if (user.getPasswordResetExpiry() == null ||
                LocalDateTime.now().isAfter(user.getPasswordResetExpiry())) {
            throw new RuntimeException("Reset token has expired");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetExpiry(null);

        // Unlock account if locked
        if (user.getAccountLocked()) {
            user.setAccountLocked(false);
            user.setFailedLoginAttempts(0);
        }

        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successfully");

        return response;
    }

    /**
     * Change Password (for logged-in users)
     * FIXED: Block OAuth users from changing passwords
     */
    @Transactional
    public Map<String, String> changePassword(ChangePasswordRequest request, User user) {
        // Block OAuth users from changing passwords
        if (user.getAuthProvider() != AuthProvider.LOCAL) {
            throw new IllegalStateException("Password cannot be changed for " + user.getAuthProvider().name() + " accounts");
        }

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully");

        return response;
    }

}