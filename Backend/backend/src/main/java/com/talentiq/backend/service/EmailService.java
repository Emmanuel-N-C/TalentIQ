package com.talentiq.backend.service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${sendgrid.api-key:}")
    private String sendgridApiKey;

    @Value("${sendgrid.from-email}")
    private String fromEmail;

    @Value("${sendgrid.from-name:TalentIQ}")
    private String fromName;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * Send OTP verification email
     */
    public void sendOtpEmail(String toEmail, String otp, String fullName) {
        String subject = "TalentIQ - Email Verification Code";
        String htmlContent = buildOtpEmailHtml(fullName, otp);
        String textContent = String.format(
                "Hello %s,\n\n" +
                        "Thank you for registering with TalentIQ!\n\n" +
                        "Your email verification code is: %s\n\n" +
                        "This code will expire in 10 minutes.\n\n" +
                        "If you didn't request this code, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "The TalentIQ Team",
                fullName, otp
        );

        sendEmail(toEmail, subject, textContent, htmlContent);
    }

    /**
     * Send password reset email with dynamic frontend URL
     */
    public void sendPasswordResetEmail(String toEmail, String resetToken, String fullName) {
        String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;
        String subject = "TalentIQ - Password Reset Request";
        String htmlContent = buildPasswordResetEmailHtml(fullName, resetUrl);
        String textContent = String.format(
                "Hello %s,\n\n" +
                        "We received a request to reset your password.\n\n" +
                        "Click the link below to reset your password:\n%s\n\n" +
                        "This link will expire in 1 hour.\n\n" +
                        "If you didn't request a password reset, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "The TalentIQ Team",
                fullName, resetUrl
        );

        sendEmail(toEmail, subject, textContent, htmlContent);
    }

    /**
     * Send welcome email after verification with dynamic frontend URL
     */
    public void sendWelcomeEmail(String toEmail, String fullName) {
        String subject = "Welcome to TalentIQ!";
        String htmlContent = buildWelcomeEmailHtml(fullName);
        String textContent = String.format(
                "Hello %s,\n\n" +
                        "Welcome to TalentIQ! Your email has been successfully verified.\n\n" +
                        "You can now log in and start using our platform at: %s/login\n\n" +
                        "Best regards,\n" +
                        "The TalentIQ Team",
                fullName, frontendUrl
        );

        sendEmail(toEmail, subject, textContent, htmlContent);
    }

    /**
     * Send email verification link (alternative to OTP)
     */
    public void sendVerificationEmail(String toEmail, String verificationToken, String fullName) {
        String verificationUrl = frontendUrl + "/verify-email?token=" + verificationToken;
        String subject = "TalentIQ - Verify Your Email Address";
        String htmlContent = buildVerificationEmailHtml(fullName, verificationUrl);
        String textContent = String.format(
                "Hello %s,\n\n" +
                        "Thank you for registering with TalentIQ!\n\n" +
                        "Please verify your email address by clicking the link below:\n%s\n\n" +
                        "This link will expire in 24 hours.\n\n" +
                        "If you didn't create an account, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "The TalentIQ Team",
                fullName, verificationUrl
        );

        sendEmail(toEmail, subject, textContent, htmlContent);
    }

    /**
     * Send password change confirmation email
     */
    public void sendPasswordChangeConfirmationEmail(String toEmail, String fullName) {
        String subject = "TalentIQ - Password Changed Successfully";
        String htmlContent = buildPasswordChangeConfirmationHtml(fullName);
        String textContent = String.format(
                "Hello %s,\n\n" +
                        "Your TalentIQ password has been changed successfully.\n\n" +
                        "If you didn't make this change, please contact us immediately at: %s\n\n" +
                        "Best regards,\n" +
                        "The TalentIQ Team",
                fullName, fromEmail
        );

        sendEmail(toEmail, subject, textContent, htmlContent);
    }

    /**
     * Core method to send email using SendGrid Web API
     */
    private void sendEmail(String toEmail, String subject, String textContent, String htmlContent) {
        // Check if SendGrid API key is configured
        if (sendgridApiKey == null || sendgridApiKey.trim().isEmpty()) {
            logger.warn("⚠️  SendGrid API key not configured. Email not sent.");
            logger.info("📧 [TEST MODE] Email would be sent to: {}", toEmail);
            logger.info("Subject: {}", subject);
            logger.info("Content:\n{}", textContent);
            return;
        }

        try {
            // Create email objects
            Email from = new Email(fromEmail, fromName);
            Email to = new Email(toEmail);
            Content content = new Content("text/html", htmlContent);

            // Build mail object
            Mail mail = new Mail(from, subject, to, content);

            // Create SendGrid client
            SendGrid sg = new SendGrid(sendgridApiKey);
            Request request = new Request();

            // Set request parameters
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            // Send email
            Response response = sg.api(request);

            // Log response
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                logger.info("✅ Email sent successfully to: {}", toEmail);
                logger.debug("SendGrid Response Code: {}", response.getStatusCode());
            } else {
                logger.error("❌ Failed to send email. Status Code: {}", response.getStatusCode());
                logger.error("Response Body: {}", response.getBody());
            }

        } catch (IOException ex) {
            logger.error("❌ Error sending email to {}: {}", toEmail, ex.getMessage(), ex);
            throw new RuntimeException("Failed to send email: " + ex.getMessage());
        }
    }

    /**
     * HTML template for OTP email
     */
    private String buildOtpEmailHtml(String fullName, String otp) {
        return String.format(
                "<!DOCTYPE html>" +
                        "<html>" +
                        "<head><meta charset='UTF-8'></head>" +
                        "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                        "<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>" +
                        "<h2 style='color: #4F46E5;'>TalentIQ Email Verification</h2>" +
                        "<p>Hello <strong>%s</strong>,</p>" +
                        "<p>Thank you for registering with TalentIQ!</p>" +
                        "<div style='background-color: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;'>" +
                        "<p style='margin: 0; font-size: 14px; color: #6B7280;'>Your verification code is:</p>" +
                        "<h1 style='margin: 10px 0; font-size: 36px; color: #4F46E5; letter-spacing: 5px;'>%s</h1>" +
                        "</div>" +
                        "<p style='color: #6B7280; font-size: 14px;'>This code will expire in <strong>10 minutes</strong>.</p>" +
                        "<p>If you didn't request this code, please ignore this email.</p>" +
                        "<hr style='border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;'>" +
                        "<p style='font-size: 12px; color: #9CA3AF;'>Best regards,<br>The TalentIQ Team</p>" +
                        "</div>" +
                        "</body>" +
                        "</html>",
                fullName, otp
        );
    }

    /**
     * HTML template for password reset email
     */
    private String buildPasswordResetEmailHtml(String fullName, String resetUrl) {
        return String.format(
                "<!DOCTYPE html>" +
                        "<html>" +
                        "<head><meta charset='UTF-8'></head>" +
                        "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                        "<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>" +
                        "<h2 style='color: #4F46E5;'>Password Reset Request</h2>" +
                        "<p>Hello <strong>%s</strong>,</p>" +
                        "<p>We received a request to reset your TalentIQ password.</p>" +
                        "<div style='text-align: center; margin: 30px 0;'>" +
                        "<a href='%s' style='background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;'>Reset Password</a>" +
                        "</div>" +
                        "<p style='color: #6B7280; font-size: 14px;'>This link will expire in <strong>1 hour</strong>.</p>" +
                        "<p style='font-size: 14px;'>If the button doesn't work, copy and paste this link into your browser:</p>" +
                        "<p style='word-break: break-all; background-color: #F3F4F6; padding: 10px; border-radius: 5px; font-size: 12px;'>%s</p>" +
                        "<p>If you didn't request a password reset, please ignore this email.</p>" +
                        "<hr style='border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;'>" +
                        "<p style='font-size: 12px; color: #9CA3AF;'>Best regards,<br>The TalentIQ Team</p>" +
                        "</div>" +
                        "</body>" +
                        "</html>",
                fullName, resetUrl, resetUrl
        );
    }

    /**
     * HTML template for welcome email
     */
    private String buildWelcomeEmailHtml(String fullName) {
        return String.format(
                "<!DOCTYPE html>" +
                        "<html>" +
                        "<head><meta charset='UTF-8'></head>" +
                        "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                        "<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>" +
                        "<h2 style='color: #4F46E5;'>🎉 Welcome to TalentIQ!</h2>" +
                        "<p>Hello <strong>%s</strong>,</p>" +
                        "<p>Your email has been successfully verified. Welcome to the TalentIQ community!</p>" +
                        "<p>You can now log in and start exploring our platform.</p>" +
                        "<div style='text-align: center; margin: 30px 0;'>" +
                        "<a href='%s/login' style='background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;'>Go to Login</a>" +
                        "</div>" +
                        "<p>We're excited to have you on board!</p>" +
                        "<hr style='border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;'>" +
                        "<p style='font-size: 12px; color: #9CA3AF;'>Best regards,<br>The TalentIQ Team</p>" +
                        "</div>" +
                        "</body>" +
                        "</html>",
                fullName, frontendUrl
        );
    }

    /**
     * HTML template for email verification link
     */
    private String buildVerificationEmailHtml(String fullName, String verificationUrl) {
        return String.format(
                "<!DOCTYPE html>" +
                        "<html>" +
                        "<head><meta charset='UTF-8'></head>" +
                        "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                        "<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>" +
                        "<h2 style='color: #4F46E5;'>Verify Your Email Address</h2>" +
                        "<p>Hello <strong>%s</strong>,</p>" +
                        "<p>Thank you for registering with TalentIQ! Please verify your email address to complete your registration.</p>" +
                        "<div style='text-align: center; margin: 30px 0;'>" +
                        "<a href='%s' style='background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;'>Verify Email</a>" +
                        "</div>" +
                        "<p style='color: #6B7280; font-size: 14px;'>This link will expire in <strong>24 hours</strong>.</p>" +
                        "<p style='font-size: 14px;'>If the button doesn't work, copy and paste this link into your browser:</p>" +
                        "<p style='word-break: break-all; background-color: #F3F4F6; padding: 10px; border-radius: 5px; font-size: 12px;'>%s</p>" +
                        "<p>If you didn't create an account, please ignore this email.</p>" +
                        "<hr style='border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;'>" +
                        "<p style='font-size: 12px; color: #9CA3AF;'>Best regards,<br>The TalentIQ Team</p>" +
                        "</div>" +
                        "</body>" +
                        "</html>",
                fullName, verificationUrl, verificationUrl
        );
    }

    /**
     * HTML template for password change confirmation
     */
    private String buildPasswordChangeConfirmationHtml(String fullName) {
        return String.format(
                "<!DOCTYPE html>" +
                        "<html>" +
                        "<head><meta charset='UTF-8'></head>" +
                        "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                        "<div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>" +
                        "<h2 style='color: #4F46E5;'>Password Changed Successfully</h2>" +
                        "<p>Hello <strong>%s</strong>,</p>" +
                        "<p>Your TalentIQ password has been changed successfully.</p>" +
                        "<p>If you didn't make this change, please contact us immediately at <strong>%s</strong>.</p>" +
                        "<div style='text-align: center; margin: 30px 0;'>" +
                        "<a href='%s/login' style='background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;'>Go to Login</a>" +
                        "</div>" +
                        "<hr style='border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;'>" +
                        "<p style='font-size: 12px; color: #9CA3AF;'>Best regards,<br>The TalentIQ Team</p>" +
                        "</div>" +
                        "</body>" +
                        "</html>",
                fullName, fromEmail, frontendUrl
        );
    }
}