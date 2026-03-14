package com.staylio.backend.Controllers;

import com.staylio.backend.model.Host;
import com.staylio.backend.model.User;
import com.staylio.backend.Service.HostService;
import com.staylio.backend.Service.UserService;
import com.staylio.backend.Repo.HostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private HostService hostService;

    @Autowired
    private HostRepository hostRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private com.staylio.backend.Service.EmailService emailService;

    // User Registration
    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signupUser(@RequestBody UserSignupRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            User user = userService.registerUser(
                    request.getFirstName(),
                    request.getLastName(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getPhone());

            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("user", createUserResponse(user));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Registration failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // User Login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody UserLoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            User user = userService.authenticateUser(request.getEmail(), request.getPassword());

            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", createUserResponse(user));

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Login failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Change Password
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody ChangePasswordRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            User user = userService.changePassword(request.getUserId(), request.getOldPassword(),
                    request.getNewPassword());

            response.put("success", true);
            response.put("message", "Password changed successfully");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Password change failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Check if email exists
    @GetMapping("/check-email/{email}")
    public ResponseEntity<Map<String, Object>> checkEmailExists(@PathVariable String email) {
        Map<String, Object> response = new HashMap<>();

        try {
            boolean exists = userService.existsByEmail(email);
            response.put("exists", exists);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("error", "Failed to check email");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

    }

    // Forgot Password - Request OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = request.get("email");
            if (email == null || email.isEmpty()) {
                throw new RuntimeException("Email is required");
            }

            userService.generatePasswordResetOtp(email);

            response.put("success", true);
            response.put("message", "OTP sent to your email");
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to send OTP");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Verify OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = request.get("email");
            String otp = request.get("otp");

            if (userService.verifyPasswordResetOtp(email, otp)) {
                response.put("success", true);
                response.put("message", "OTP verified successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Invalid or expired OTP");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to verify OTP");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Reset Password with OTP
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = request.get("email");
            String otp = request.get("otp");
            String newPassword = request.get("newPassword");

            userService.resetPasswordWithOtp(email, otp, newPassword);

            response.put("success", true);
            response.put("message", "Password reset successfully");
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to reset password");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("firstName", user.getFirstName());
        userResponse.put("lastName", user.getLastName());
        userResponse.put("fullName", user.getFullName());
        userResponse.put("email", user.getEmail());
        userResponse.put("phone", user.getPhone());
        userResponse.put("role", "user");
        userResponse.put("createdAt", user.getCreatedAt());
        return userResponse;
    }

    // Host Registration
    @PostMapping("/signup-host")
    public ResponseEntity<Map<String, Object>> signupHost(@RequestBody HostSignupRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Check if email already exists
            if (hostService.existsByEmail(request.getEmail())) {
                response.put("success", false);
                response.put("message", "An account with this email already exists");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            // Create new host
            Host host = new Host();
            host.setOwnerName(request.getOwnerName());
            host.setEmail(request.getEmail());
            host.setPhone(request.getPhone());
            host.setPassword(request.getPassword()); // In production, hash this password
            host.setCompanyName(request.getCompanyName());
            host.setBusinessAddress(request.getBusinessAddress());
            host.setKycDocumentUrl(request.getKycDocumentUrl());
            host.setPayoutDetails(request.getPayoutDetails());
            host.setStatus(Host.HostStatus.PENDING_APPROVAL);

            Host savedHost = hostService.createHost(host);

            // Send registration email
            try {
                emailService.sendHostRegistrationEmail(
                        savedHost.getEmail(),
                        savedHost.getOwnerName(),
                        savedHost.getCompanyName());
            } catch (Exception emailEx) {
                // Log but don't fail registration if email fails
                System.err.println("Failed to send host registration email: " + emailEx.getMessage());
            }

            response.put("success", true);
            response.put("message",
                    "Your application has been submitted for admin approval. You will be able to log in once approved.");
            response.put("hostId", savedHost.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // Host Login
    @PostMapping("/login-host")
    public ResponseEntity<Map<String, Object>> loginHost(@RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            Host host = hostRepository.findByEmail(request.getEmail());

            if (host == null) {
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Check password (in production, use proper password hashing)
            if (!host.getPassword().equals(request.getPassword())) {
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Check host status
            switch (host.getStatus()) {
                case APPROVED:
                    response.put("success", true);
                    response.put("message", "Login successful");
                    response.put("user", createHostResponse(host));
                    return ResponseEntity.ok(response);

                case PENDING_APPROVAL:
                    response.put("success", false);
                    response.put("message", "Your application is under review by the admin.");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);

                case REJECTED:
                    response.put("success", false);
                    response.put("message", "Your application has been rejected by the admin.");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);

                default:
                    response.put("success", false);
                    response.put("message", "Account status unknown");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private Map<String, Object> createHostResponse(Host host) {
        Map<String, Object> user = new HashMap<>();
        user.put("id", host.getId());
        user.put("name", host.getOwnerName());
        user.put("email", host.getEmail());
        user.put("phone", host.getPhone());
        user.put("companyName", host.getCompanyName());
        user.put("role", "host");
        user.put("status", host.getStatus().toString());
        return user;
    }

    // Request DTOs
    public static class HostSignupRequest {
        private String ownerName;
        private String email;
        private String phone;
        private String password;
        private String companyName;
        private String businessAddress;
        private String kycDocumentUrl;
        private String payoutDetails;

        // Getters and Setters
        public String getOwnerName() {
            return ownerName;
        }

        public void setOwnerName(String ownerName) {
            this.ownerName = ownerName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getCompanyName() {
            return companyName;
        }

        public void setCompanyName(String companyName) {
            this.companyName = companyName;
        }

        public String getBusinessAddress() {
            return businessAddress;
        }

        public void setBusinessAddress(String businessAddress) {
            this.businessAddress = businessAddress;
        }

        public String getKycDocumentUrl() {
            return kycDocumentUrl;
        }

        public void setKycDocumentUrl(String kycDocumentUrl) {
            this.kycDocumentUrl = kycDocumentUrl;
        }

        public String getPayoutDetails() {
            return payoutDetails;
        }

        public void setPayoutDetails(String payoutDetails) {
            this.payoutDetails = payoutDetails;
        }
    }

    public static class LoginRequest {
        private String email;
        private String password;

        // Getters and Setters
        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    // User Request DTOs
    public static class UserSignupRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
        private String phone;

        // Getters and Setters
        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }
    }

    public static class UserLoginRequest {
        private String email;
        private String password;

        // Getters and Setters
        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class ChangePasswordRequest {
        private Long userId;
        private String oldPassword;
        private String newPassword;

        // Getters and Setters
        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getOldPassword() {
            return oldPassword;
        }

        public void setOldPassword(String oldPassword) {
            this.oldPassword = oldPassword;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}