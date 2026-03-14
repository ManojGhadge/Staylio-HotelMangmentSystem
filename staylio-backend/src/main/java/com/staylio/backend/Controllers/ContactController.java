package com.staylio.backend.Controllers;

import com.staylio.backend.Service.EmailService;
import com.staylio.backend.dto.ContactRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "*") // Allow requests from frontend
public class ContactController {

    @Autowired
    private EmailService emailService;

    @PostMapping
    public ResponseEntity<?> submitContactForm(@RequestBody ContactRequest request) {
        Map<String, String> response = new HashMap<>();
        try {
            if (request.getEmail() == null || request.getMessage() == null) {
                response.put("error", "Email and Message are required");
                return ResponseEntity.badRequest().body(response);
            }

            emailService.sendContactUsEmail(
                    request.getName(),
                    request.getEmail(),
                    request.getSubject(),
                    request.getMessage());

            response.put("message", "Message sent successfully");
            return ResponseEntity.ok().body(response);
        } catch (Exception e) {
            response.put("error", "Failed to send message: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
