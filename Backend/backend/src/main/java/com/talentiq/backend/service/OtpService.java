package com.talentiq.backend.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    // In-memory storage (use Redis for production)
    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private static final int OTP_LENGTH = 6;
    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 3;

    private static class OtpData {
        String otp;
        LocalDateTime expiry;
        int attempts;

        OtpData(String otp, LocalDateTime expiry) {
            this.otp = otp;
            this.expiry = expiry;
            this.attempts = 0;
        }
    }

    public String generateOtp(String email) {
        String otp = generateRandomOtp();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);
        otpStorage.put(email.toLowerCase(), new OtpData(otp, expiry));
        return otp;
    }

    public boolean validateOtp(String email, String otp) {
        String emailKey = email.toLowerCase();
        OtpData data = otpStorage.get(emailKey);

        if (data == null) {
            return false;
        }

        // Check if expired
        if (LocalDateTime.now().isAfter(data.expiry)) {
            otpStorage.remove(emailKey);
            return false;
        }

        // Check attempts
        if (data.attempts >= MAX_ATTEMPTS) {
            otpStorage.remove(emailKey);
            return false;
        }

        data.attempts++;

        // Validate OTP
        if (data.otp.equals(otp)) {
            otpStorage.remove(emailKey);
            return true;
        }

        return false;
    }

    public void removeOtp(String email) {
        otpStorage.remove(email.toLowerCase());
    }

    private String generateRandomOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
}