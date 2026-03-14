package com.staylio.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    @Value("${spring.mail.from:noreply@staylio.com}")
    private String fromEmail;

    @Value("${spring.mail.from.name:StayLio}")
    private String fromName;

    private boolean isEmailConfigured() {
        return mailSender != null &&
                mailUsername != null && !mailUsername.isEmpty() &&
                mailPassword != null && !mailPassword.isEmpty();
    }

    public void sendSimpleEmail(String to, String subject, String text) {
        if (!isEmailConfigured()) {
            logger.warn("Email not configured. Skipping email to: {}", to);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            logger.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            logger.error("Failed to send email to: {}. Error: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (!isEmailConfigured()) {
            logger.warn("Email not configured. Skipping HTML email to: {}", to);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (Exception e) {
            logger.error("Failed to send HTML email to: {}. Error: {}", to, e.getMessage());
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }

    public void sendWelcomeEmail(String to, String firstName, String lastName) {
        if (!isEmailConfigured()) {
            logger.info("Email not configured. Skipping welcome email to: {}", to);
            return;
        }

        String subject = "Welcome to StayLio - Your Journey Begins Here!";
        String htmlContent = buildWelcomeEmailHtml(firstName, lastName);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            logger.info("Welcome email sent to: {}", to);
        } catch (Exception e) {
            logger.warn("Failed to send welcome email to: {}. Error: {}", to, e.getMessage());
        }
    }

    private String buildWelcomeEmailHtml(String firstName, String lastName) {
        String fullName = firstName + " " + lastName;
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Welcome to StayLio</title></head>" +
                "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">" +
                "<div style=\"background: #4A90E2; color: white; padding: 20px; text-align: center;\">" +
                "<h1>Welcome to StayLio!</h1></div>" +
                "<div style=\"padding: 20px;\"><h2>Hello " + fullName + "!</h2>" +
                "<p>Thank you for joining StayLio. Your account has been created successfully.</p>" +
                "<p>Start exploring amazing accommodations today!</p></div></body></html>";
    }

    public void sendHostRegistrationEmail(String to, String ownerName, String companyName) {
        if (!isEmailConfigured()) {
            logger.info("Email not configured. Skipping host registration email to: {}", to);
            return;
        }

        String subject = "Host Application Received - " + companyName;
        String htmlContent = buildHostRegistrationEmailHtml(ownerName, companyName);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            logger.info("Host registration email sent to: {}", to);
        } catch (Exception e) {
            logger.warn("Failed to send host registration email to: {}. Error: {}", to, e.getMessage());
        }
    }

    private String buildHostRegistrationEmailHtml(String ownerName, String companyName) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head>" +
                "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">" +
                "<div style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;\">"
                +
                "<h1>Application Received!</h1></div>" +
                "<div style=\"padding: 20px;\"><h2>Hello " + ownerName + ",</h2>" +
                "<p>Thank you for submitting your host application for <strong>" + companyName + "</strong>.</p>" +
                "<p>Your application is under review. We'll notify you within 24-48 hours.</p>" +
                "<p>You'll be able to login once approved.</p></div></body></html>";
    }

    public void sendHostApprovalEmail(String to, String ownerName, String companyName) {
        if (!isEmailConfigured()) {
            logger.info("Email not configured. Skipping host approval email to: {}", to);
            return;
        }

        String subject = "Congratulations! Host Application Approved";
        String htmlContent = buildHostApprovalEmailHtml(ownerName, companyName);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            logger.info("Host approval email sent to: {}", to);
        } catch (Exception e) {
            logger.warn("Failed to send host approval email to: {}. Error: {}", to, e.getMessage());
        }
    }

    private String buildHostApprovalEmailHtml(String ownerName, String companyName) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head>" +
                "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">" +
                "<div style=\"background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;\">"
                +
                "<h1>🎉 Approved!</h1></div>" +
                "<div style=\"padding: 20px;\"><h2>Congratulations " + ownerName + "!</h2>" +
                "<p>Your host application for <strong>" + companyName + "</strong> has been approved!</p>" +
                "<p>You can now login and start managing your properties.</p>" +
                "<p><a href=\"http://localhost:5175\" style=\"background: #11998e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;\">Login to Dashboard</a></p></div></body></html>";
    }

    public void sendHostRejectionEmail(String to, String ownerName, String reason) {
        if (!isEmailConfigured()) {
            logger.info("Email not configured. Skipping host rejection email to: {}", to);
            return;
        }

        String subject = "Host Application Update";
        String htmlContent = buildHostRejectionEmailHtml(ownerName, reason);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            logger.info("Host rejection email sent to: {}", to);
        } catch (Exception e) {
            logger.warn("Failed to send host rejection email to: {}. Error: {}", to, e.getMessage());
        }
    }

    private String buildHostRejectionEmailHtml(String ownerName, String reason) {
        String displayReason = (reason != null && !reason.trim().isEmpty()) ? reason
                : "Please contact support for details.";
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head>" +
                "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">" +
                "<div style=\"background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px;\">"
                +
                "<h1>Application Update</h1></div>" +
                "<div style=\"padding: 20px;\"><h2>Dear " + ownerName + ",</h2>" +
                "<p>We regret to inform you that your host application cannot be approved at this time.</p>" +
                "<p><strong>Reason:</strong> " + displayReason + "</p>" +
                "<p>You're welcome to reapply after addressing the concerns.</p></div></body></html>";
    }

    public void sendBookingConfirmationEmail(String to, String guestName, String hotelName,
            String bookingReference, String checkIn, String checkOut, String totalAmount,
            String paymentMethod, String transactionId, int rooms, int guests) {
        if (!isEmailConfigured()) {
            logger.info("Email not configured. Skipping booking confirmation email to: {}", to);
            return;
        }

        String subject = "Booking Confirmed - " + bookingReference;
        String htmlContent = buildBookingConfirmationEmailHtml(guestName, hotelName, bookingReference,
                checkIn, checkOut, totalAmount, paymentMethod, transactionId, rooms, guests);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            logger.info("Booking confirmation email sent to: {}", to);
        } catch (Exception e) {
            logger.warn("Failed to send booking confirmation email to: {}. Error: {}", to, e.getMessage());
        }
    }

    private String buildBookingConfirmationEmailHtml(String guestName, String hotelName,
            String bookingReference, String checkIn, String checkOut, String totalAmount,
            String paymentMethod, String transactionId, int rooms, int guests) {

        boolean isOnline = paymentMethod != null && paymentMethod.toUpperCase().contains("ONLINE");
        String badge = isOnline
                ? "<span style=\"background: #11998e; color: white; padding: 5px 15px; border-radius: 15px;\">✓ PAID ONLINE</span>"
                : "<span style=\"background: #ff9800; color: white; padding: 5px 15px; border-radius: 15px;\">⏰ PAY AT HOTEL</span>";

        String transactionSection = isOnline && transactionId != null
                ? "<tr><td style=\"padding: 10px; border-bottom: 1px solid #ddd;\">Transaction ID:</td><td style=\"padding: 10px; border-bottom: 1px solid #ddd;\"><strong>"
                        + transactionId + "</strong></td></tr>"
                : "";

        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head>" +
                "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">" +
                "<div style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;\">"
                +
                "<h1>✅ Booking Confirmed!</h1></div>" +
                "<div style=\"padding: 20px;\"><h2>Dear " + guestName + ",</h2>" +
                "<p>Your booking is confirmed!</p>" +
                "<div style=\"text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;\">"
                + bookingReference + "</div>" +
                "<div style=\"text-align: center; margin: 15px 0;\">" + badge + "</div>" +
                "<table style=\"width: 100%; border-collapse: collapse; margin: 20px 0;\">" +
                "<tr><td style=\"padding: 10px; border-bottom: 1px solid #ddd;\">Hotel:</td><td style=\"padding: 10px; border-bottom: 1px solid #ddd;\"><strong>"
                + hotelName + "</strong></td></tr>" +
                "<tr><td style=\"padding: 10px; border-bottom: 1px solid #ddd;\">Check-in:</td><td style=\"padding: 10px; border-bottom: 1px solid #ddd;\">"
                + checkIn + "</td></tr>" +
                "<tr><td style=\"padding: 10px; border-bottom: 1px solid #ddd;\">Check-out:</td><td style=\"padding: 10px; border-bottom: 1px solid #ddd;\">"
                + checkOut + "</td></tr>" +
                "<tr><td style=\"padding: 10px; border-bottom: 1px solid #ddd;\">Rooms:</td><td style=\"padding: 10px; border-bottom: 1px solid #ddd;\">"
                + rooms + "</td></tr>" +
                "<tr><td style=\"padding: 10px; border-bottom: 1px solid #ddd;\">Guests:</td><td style=\"padding: 10px; border-bottom: 1px solid #ddd;\">"
                + guests + "</td></tr>" +
                transactionSection +
                "<tr style=\"background: #667eea; color: white;\"><td style=\"padding: 10px;\">Total Amount:</td><td style=\"padding: 10px;\"><strong>₹"
                + totalAmount + "</strong></td></tr>" +
                "</table>" +
                (isOnline ? "<p style=\"color: #11998e;\">✓ Payment successful. This is your receipt.</p>"
                        : "<p style=\"color: #ff9800;\">💳 Please pay ₹" + totalAmount + " at the hotel.</p>")
                +
                "</div></body></html>";
    }

    public void sendHotelClaimSubmissionEmail(String to, String ownerName, String hotelName) {
        if (!isEmailConfigured()) {
            logger.info("Email not configured. Skipping hotel claim submission email to: {}", to);
            return;
        }

        String subject = "Hotel Claim Submitted - " + hotelName;
        String htmlContent = buildHotelClaimSubmissionEmailHtml(ownerName, hotelName);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            logger.info("Hotel claim submission email sent to: {}", to);
        } catch (Exception e) {
            logger.warn("Failed to send hotel claim submission email to: {}. Error: {}", to, e.getMessage());
        }
    }

    private String buildHotelClaimSubmissionEmailHtml(String ownerName, String hotelName) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head>" +
                "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">" +
                "<div style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;\">"
                +
                "<h1>Claim Submitted!</h1></div>" +
                "<div style=\"padding: 20px;\"><h2>Hello " + ownerName + ",</h2>" +
                "<p>Your claim for <strong>" + hotelName + "</strong> has been submitted successfully.</p>" +
                "<p>Our team will review your claim within 24-48 hours.</p>" +
                "<p>You'll receive an email once the review is complete.</p></div></body></html>";
    }

    public void sendHotelClaimApprovalEmail(String to, String ownerName, String hotelName) {
        if (!isEmailConfigured()) {
            logger.info("Email not configured. Skipping hotel claim approval email to: {}", to);
            return;
        }

        String subject = "Hotel Claim Approved - " + hotelName;
        String htmlContent = buildHotelClaimApprovalEmailHtml(ownerName, hotelName);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            logger.info("Hotel claim approval email sent to: {}", to);
        } catch (Exception e) {
            logger.warn("Failed to send hotel claim approval email to: {}. Error: {}", to, e.getMessage());
        }
    }

    private String buildHotelClaimApprovalEmailHtml(String ownerName, String hotelName) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head>" +
                "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">" +
                "<div style=\"background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px;\">"
                +
                "<h1>🎉 Claim Approved!</h1></div>" +
                "<div style=\"padding: 20px;\"><h2>Congratulations " + ownerName + "!</h2>" +
                "<p>Your claim for <strong>" + hotelName + "</strong> has been approved!</p>" +
                "<p>The hotel has been added to your dashboard.</p>" +
                "<p><a href=\"http://localhost:5175\" style=\"background: #11998e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;\">Go to Dashboard</a></p></div></body></html>";
    }

    public void sendHotelClaimRejectionEmail(String to, String ownerName, String hotelName, String reason) {
        if (!isEmailConfigured()) {
            logger.info("Email not configured. Skipping hotel claim rejection email to: {}", to);
            return;
        }

        String subject = "Hotel Claim Update - " + hotelName;
        String htmlContent = buildHotelClaimRejectionEmailHtml(ownerName, hotelName, reason);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            logger.info("Hotel claim rejection email sent to: {}", to);
        } catch (Exception e) {
            logger.warn("Failed to send hotel claim rejection email to: {}. Error: {}", to, e.getMessage());
        }
    }

    private String buildHotelClaimRejectionEmailHtml(String ownerName, String hotelName, String reason) {
        String displayReason = (reason != null && !reason.trim().isEmpty()) ? reason
                : "Please contact support for details.";
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head>" +
                "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">" +
                "<div style=\"background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px;\">"
                +
                "<h1>Claim Update</h1></div>" +
                "<div style=\"padding: 20px;\"><h2>Dear " + ownerName + ",</h2>" +
                "<p>We regret to inform you that your claim for <strong>" + hotelName
                + "</strong> cannot be approved at this time.</p>" +
                "<p><strong>Reason:</strong> " + displayReason + "</p>" +
                "<p>You're welcome to resubmit with updated documentation.</p></div></body></html>";
    }

    public void sendContactUsEmail(String name, String userEmail, String subject, String messageContent) {
        // Admin email where queries should be sent
        String adminEmail = "jagdishbabalsure89@gmail.com";

        if (!isEmailConfigured()) {
            logger.info("Email not configured. Skipping contact us email.");
            return;
        }

        String fullSubject = "New Contact Query: " + subject;
        String htmlContent = buildContactUsEmailHtml(name, userEmail, subject, messageContent);

        try {
            sendHtmlEmail(adminEmail, fullSubject, htmlContent);
            logger.info("Contact Us email sent to admin: {}", adminEmail);
        } catch (Exception e) {
            logger.warn("Failed to send Contact Us email. Error: {}", e.getMessage());
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String buildContactUsEmailHtml(String name, String email, String subject, String message) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head>" +
                "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">" +
                "<div style=\"background: #8400ff; color: white; padding: 20px; text-align: center; border-radius: 10px;\">"
                +
                "<h1>New Contact Query</h1></div>" +
                "<div style=\"padding: 20px; border: 1px solid #ddd; border-radius: 0 0 10px 10px;\">" +
                "<p><strong>From:</strong> " + name + "</p>" +
                "<p><strong>Email:</strong> <a href=\"mailto:" + email + "\">" + email + "</a></p>" +
                "<p><strong>Subject:</strong> " + subject + "</p>" +
                "<hr style=\"border: 0; border-top: 1px solid #eee; margin: 20px 0;\" />" +
                "<h3>Message:</h3>" +
                "<p style=\"white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 5px; color: #333;\">"
                + message + "</p>" +
                "</div>" +
                "<div style=\"text-align: center; margin-top: 20px; color: #888; font-size: 12px;\">" +
                "Sent from StayLio Contact Form" +
                "</div></body></html>";
    }

    public void sendBookingCancellationEmailToGuest(String to, String guestName, String hotelName,
            String bookingReference, String refundStatus) {
        if (!isEmailConfigured()) {
            logger.info("Email not configured. Skipping cancellation email to guest: {}", to);
            return;
        }

        String subject = "Booking Cancelled - " + bookingReference;
        String htmlContent = buildBookingCancellationEmailHtmlForGuest(guestName, hotelName, bookingReference,
                refundStatus);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            logger.info("Cancellation email sent to guest: {}", to);
        } catch (Exception e) {
            logger.warn("Failed to send cancellation email to guest: {}. Error: {}", to, e.getMessage());
        }
    }

    private String buildBookingCancellationEmailHtmlForGuest(String guestName, String hotelName,
            String bookingReference, String refundStatus) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head>" +
                "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">" +
                "<div style=\"background: #ff4757; color: white; padding: 30px; text-align: center; border-radius: 10px;\">"
                +
                "<h1>🚫 Booking Cancelled</h1></div>" +
                "<div style=\"padding: 20px;\"><h2>Dear " + guestName + ",</h2>" +
                "<p>Your booking for <strong>" + hotelName + "</strong> has been cancelled as requested.</p>" +
                "<p><strong>Booking Reference:</strong> " + bookingReference + "</p>" +
                "<div style=\"background: #f1f2f6; padding: 15px; border-radius: 5px; margin: 20px 0;\">" +
                "<strong>Refund Status:</strong> " + refundStatus +
                "</div>" +
                "<p>If you have any questions, please contact our support team.</p></div></body></html>";
    }

    public void sendBookingCancellationEmailToHost(String to, String hostName, String bookingReference,
            String guestName, String hotelName) {
        if (!isEmailConfigured()) {
            logger.info("Email not configured. Skipping cancellation email to host: {}", to);
            return;
        }

        String subject = "Booking Cancelled by Guest - " + bookingReference;
        String htmlContent = buildBookingCancellationEmailHtmlForHost(hostName, bookingReference, guestName, hotelName);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            logger.info("Cancellation email sent to host: {}", to);
        } catch (Exception e) {
            logger.warn("Failed to send cancellation email to host: {}. Error: {}", to, e.getMessage());
        }
    }

    private String buildBookingCancellationEmailHtmlForHost(String hostName, String bookingReference,
            String guestName, String hotelName) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head>" +
                "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">" +
                "<div style=\"background: #ff6b6b; color: white; padding: 30px; text-align: center; border-radius: 10px;\">"
                +
                "<h1>Booking Cancelled</h1></div>" +
                "<div style=\"padding: 20px;\"><h2>Hello " + hostName + ",</h2>" +
                "<p>The following booking at <strong>" + hotelName + "</strong> has been cancelled by the guest.</p>" +
                "<ul style=\"list-style: none; padding: 0;\">" +
                "<li><strong>Guest:</strong> " + guestName + "</li>" +
                "<li><strong>Reference:</strong> " + bookingReference + "</li>" +
                "</ul>" +
                "<p>The availability has been updated automatically.</p>" +
                "<p><a href=\"http://localhost:5175\" style=\"color: #ff6b6b; font-weight: bold;\">View in Dashboard</a></p></div></body></html>";
    }

    public void sendBookingConfirmationEmail(String to, String guestName, String hotelName, String bookingReference,
            String checkInDate, String checkOutDate, String totalAmount,
            String address, String city, String country) {
        if (!isEmailConfigured()) {
            logger.info("Email not configured. Skipping booking confirmation email to: {}", to);
            return;
        }

        String subject = "Booking Confirmed! Your Stay at " + hotelName + " is Secured";
        String htmlContent = buildBookingConfirmationEmailHtml(guestName, hotelName, bookingReference,
                checkInDate, checkOutDate, totalAmount,
                address, city, country);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            logger.info("Booking confirmation email sent to: {}", to);
        } catch (Exception e) {
            logger.warn("Failed to send booking confirmation email to: {}. Error: {}", to, e.getMessage());
        }
    }

    private String buildBookingConfirmationEmailHtml(String guestName, String hotelName, String bookingReference,
            String checkInDate, String checkOutDate, String totalAmount,
            String address, String city, String country) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9; }
                        .header { background: linear-gradient(to right, #6366f1, #a855f7, #ec4899); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { padding: 30px; background-color: white; border-radius: 0 0 10px 10px; }
                        .booking-details { background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
                        .detail-row:last-child { border-bottom: none; }
                        .label { font-weight: 600; color: #4b5563; }
                        .value { color: #1f2937; font-weight: 500; }
                        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
                        .button { display: inline-block; padding: 12px 24px; background-color: #a855f7; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Booking Confirmed!</h1>
                            <p>Your reservation is all set</p>
                        </div>
                        <div class="content">
                            <p>Hello <strong>%s</strong>,</p>
                            <p>Great news! Your booking at <strong>%s</strong> has been successfully confirmed. We are excited to host you!</p>

                            <div class="booking-details">
                                <h3 style="margin-top: 0; color: #15803d;">Booking Summary</h3>
                                <div class="detail-row">
                                    <span class="label">Booking Reference:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Hotel:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Check-in:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Check-out:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Location:</span>
                                    <span class="value">%s, %s, %s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Total Amount:</span>
                                    <span class="value" style="color: #a855f7; font-weight: bold;">₹%s</span>
                                </div>
                            </div>

                            <p><strong>Important Information:</strong></p>
                            <ul>
                                <li>Please present a valid government ID upon check-in.</li>
                                <li>Check-in time is usually 2:00 PM and Check-out is 11:00 AM.</li>
                            </ul>

                            <div style="text-align: center;">
                                <a href="#" class="button">View My Books</a>
                            </div>
                        </div>
                        <div class="footer">
                            <p>&copy; 2024 StayLio. All rights reserved.</p>
                            <p>This is an automated message, please do not reply directly to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(guestName, hotelName, bookingReference, hotelName, checkInDate, checkOutDate, address, city,
                        country, totalAmount);
    }

    public void sendPasswordResetOtp(String to, String otp) {
        if (!isEmailConfigured()) {
            logger.info("Email not configured. Skipping password reset OTP email to: {}", to);
            return;
        }

        String subject = "Password Reset OTP - StayLio";
        String htmlContent = buildPasswordResetOtpHtml(otp);

        try {
            sendHtmlEmail(to, subject, htmlContent);
            logger.info("Password reset OTP email sent to: {}", to);
        } catch (Exception e) {
            logger.warn("Failed to send password reset OTP email to: {}. Error: {}", to, e.getMessage());
        }
    }

    private String buildPasswordResetOtpHtml(String otp) {
        return "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"></head>" +
                "<body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\">" +
                "<div style=\"background: #8b5cf6; color: white; padding: 30px; text-align: center; border-radius: 10px;\">"
                +
                "<h1>Password Reset OTP</h1></div>" +
                "<div style=\"padding: 20px; text-align: center;\">" +
                "<p>You requested a password reset. Use the following OTP to proceed:</p>" +
                "<h2 style=\"font-size: 32px; letter-spacing: 5px; color: #8b5cf6; background: #f3f4f6; padding: 15px; border-radius: 5px; display: inline-block;\">"
                +
                otp + "</h2>" +
                "<p>This OTP is valid for 10 minutes.</p>" +
                "<p>If you didn't request this, please ignore this email.</p>" +
                "</div></body></html>";
    }

}
