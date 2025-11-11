package com.talentiq.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp, String fullName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("TalentIQ - Email Verification Code");
        message.setText(String.format(
                "Hello %s,\n\n" +
                        "Thank you for registering with TalentIQ!\n\n" +
                        "Your email verification code is: %s\n\n" +
                        "This code will expire in 10 minutes.\n\n" +
                        "If you didn't request this code, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "The TalentIQ Team",
                fullName, otp
        ));

        mailSender.send(message);
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken, String fullName) {
        String resetUrl = "http://localhost:5173/reset-password?token=" + resetToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("TalentIQ - Password Reset Request");
        message.setText(String.format(
                "Hello %s,\n\n" +
                        "We received a request to reset your password.\n\n" +
                        "Click the link below to reset your password:\n%s\n\n" +
                        "This link will expire in 1 hour.\n\n" +
                        "If you didn't request a password reset, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "The TalentIQ Team",
                fullName, resetUrl
        ));

        mailSender.send(message);
    }

    public void sendWelcomeEmail(String toEmail, String fullName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Welcome to TalentIQ!");
        message.setText(String.format(
                "Hello %s,\n\n" +
                        "Welcome to TalentIQ! Your email has been successfully verified.\n\n" +
                        "You can now log in and start using our platform.\n\n" +
                        "Best regards,\n" +
                        "The TalentIQ Team",
                fullName
        ));

        mailSender.send(message);
    }
}