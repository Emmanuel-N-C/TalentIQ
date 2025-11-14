package com.talentiq.backend.config;

import com.talentiq.backend.model.AuthProvider;
import com.talentiq.backend.model.Role;
import com.talentiq.backend.model.User;
import com.talentiq.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Automatically creates an ADMIN user at application startup if one doesn't exist.
 * Admin credentials are loaded from environment variables for security.
 * Admin is pre-verified and does NOT require OTP.
 */
@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${admin.email:#{null}}")
    private String adminEmail;

    @Value("${admin.password:#{null}}")
    private String adminPassword;

    @Override
    public void run(String... args) throws Exception {
        // Check if admin credentials are configured
        if (adminEmail == null || adminEmail.trim().isEmpty() ||
                adminPassword == null || adminPassword.trim().isEmpty()) {
            logger.warn("⚠️  Admin credentials not configured. Skipping admin initialization.");
            logger.warn("    Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables to create admin user.");
            return;
        }

        // Check if admin user already exists
        if (userRepository.existsByEmail(adminEmail)) {
            logger.info("✅ Admin user already exists: {}", adminEmail);

            // Optional: Verify the existing user is actually an admin
            userRepository.findByEmail(adminEmail).ifPresent(existingUser -> {
                if (existingUser.getRole() != Role.ADMIN) {
                    logger.warn("⚠️  User {} exists but is NOT an admin! Current role: {}",
                            adminEmail, existingUser.getRole());
                } else if (!existingUser.getEmailVerified()) {
                    logger.warn("⚠️  Admin user {} exists but email is NOT verified. Fixing...", adminEmail);
                    existingUser.setEmailVerified(true);
                    userRepository.save(existingUser);
                    logger.info("✅ Admin email verification status fixed.");
                } else {
                    logger.info("✅ Admin user is properly configured.");
                }
            });

            return;
        }

        // Create new admin user
        logger.info("🔧 Creating admin user: {}", adminEmail);

        User admin = new User();
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setFullName("System Administrator");
        admin.setRole(Role.ADMIN);
        admin.setAuthProvider(AuthProvider.LOCAL);

        // CRITICAL: Admin is pre-verified, no OTP required
        admin.setEmailVerified(true);

        // Security settings
        admin.setAccountLocked(false);
        admin.setFailedLoginAttempts(0);
        admin.setLastLoginAt(null);

        // Clear any verification tokens (admin doesn't need them)
        admin.setEmailVerificationToken(null);
        admin.setEmailVerificationExpiry(null);
        admin.setPasswordResetToken(null);
        admin.setPasswordResetExpiry(null);

        userRepository.save(admin);

        logger.info("✅ Admin user created successfully!");
        logger.info("   Email: {}", adminEmail);
        logger.info("   Role: ADMIN");
        logger.info("   Email Verified: true");
        logger.info("   Auth Provider: LOCAL");
        logger.info("🔐 Admin can now login without OTP verification.");
    }
}