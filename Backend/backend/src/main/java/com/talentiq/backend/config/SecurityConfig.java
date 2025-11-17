package com.talentiq.backend.config;

import com.talentiq.backend.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Enable CORS with custom configuration
                .cors(cors -> cors.configurationSource(corsConfigurationSource))

                // Disable CSRF for stateless API
                .csrf(csrf -> csrf.disable())

                // Stateless session management
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Authorization rules
                .authorizeHttpRequests(auth -> auth
                        // ========== PUBLIC ENDPOINTS (No Authentication Required) ==========

                        // Auth endpoints - Registration & Login
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/verify-otp",
                                "/api/auth/resend-otp",
                                "/api/auth/forgot-password",
                                "/api/auth/reset-password"
                        ).permitAll()

                        // OAuth endpoints
                        .requestMatchers("/api/auth/oauth/**").permitAll()

                        // Test endpoints (remove in production if not needed)
                        .requestMatchers("/api/test/**").permitAll()

                        // Public profile pictures
                        .requestMatchers("/api/user/profile-picture/**").permitAll()

                        // Health check endpoints (for Render/monitoring)
                        .requestMatchers("/actuator/health", "/health", "/api/health").permitAll()

                        // ========== ROLE-BASED PROTECTED ENDPOINTS ==========

                        // Admin-only routes
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Jobs - accessible to recruiters, job seekers, and admins
                        .requestMatchers("/api/jobs/**").hasAnyRole("RECRUITER", "JOB_SEEKER", "ADMIN")

                        // FIXED: Applications - accessible to job seekers, recruiters, and admins
                        .requestMatchers("/api/applications/**").hasAnyRole("JOB_SEEKER", "RECRUITER", "ADMIN")

                        // Resumes - accessible to job seekers, recruiters, and admins
                        .requestMatchers("/api/resumes/**").hasAnyRole("JOB_SEEKER", "RECRUITER", "ADMIN")

                        // AI/CV Analyzer - accessible to recruiters and admins
                        .requestMatchers("/api/ai/**", "/api/analyze/**").hasAnyRole("RECRUITER", "ADMIN")

                        // Matching system - accessible to job seekers, recruiters, and admins
                        .requestMatchers("/api/match/**").hasAnyRole("JOB_SEEKER", "RECRUITER", "ADMIN")

                        // File uploads (AWS S3) - authenticated users only
                        .requestMatchers("/api/upload/**", "/api/files/**").authenticated()

                        // User profile management (requires authentication)
                        .requestMatchers("/api/user/**").authenticated()

                        // Password change (requires authentication)
                        .requestMatchers("/api/auth/change-password").authenticated()

                        // ========== DEFAULT: ALL OTHER REQUESTS REQUIRE AUTHENTICATION ==========
                        .anyRequest().authenticated()
                );

        // Set authentication provider
        http.authenticationProvider(authenticationProvider());

        // Add JWT filter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}