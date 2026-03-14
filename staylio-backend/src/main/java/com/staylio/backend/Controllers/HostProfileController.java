package com.staylio.backend.Controllers;

import com.staylio.backend.model.Host;
import com.staylio.backend.Service.HostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/host")
@CrossOrigin(origins = "*")
public class HostProfileController {

    @Autowired
    private HostService hostService;

    // Get host profile by ID
    @GetMapping("/profile/{hostId}")
    public ResponseEntity<Map<String, Object>> getHostProfile(@PathVariable Long hostId) {
        Map<String, Object> response = new HashMap<>();

        try {
            Host host = hostService.getHostById(hostId);

            response.put("success", true);
            response.put("data", createHostProfileResponse(host));

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", "Host not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to get profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Update host profile
    @PutMapping("/profile/{hostId}")
    public ResponseEntity<Map<String, Object>> updateHostProfile(
            @PathVariable Long hostId,
            @RequestBody HostProfileUpdateRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            Host existingHost = hostService.getHostById(hostId);

            // Update host details
            Host hostDetails = new Host();
            hostDetails.setOwnerName(request.getOwnerName());
            // Email cannot be changed - always use existing email
            hostDetails.setEmail(existingHost.getEmail());
            hostDetails.setPhone(request.getPhone());
            hostDetails.setCompanyName(request.getCompanyName());
            hostDetails.setBusinessAddress(request.getBusinessAddress());
            hostDetails.setKycDocumentUrl(request.getKycDocumentUrl());
            hostDetails.setPayoutDetails(request.getPayoutDetails());
            // Don't allow status change from host profile update
            hostDetails.setStatus(existingHost.getStatus());

            Host updatedHost = hostService.updateHost(hostId, hostDetails);

            response.put("success", true);
            response.put("message", "Profile updated successfully");
            response.put("data", createHostProfileResponse(updatedHost));

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                response.put("success", false);
                response.put("message", "Host not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            response.put("success", false);
            response.put("message", "Update failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private Map<String, Object> createHostProfileResponse(Host host) {
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", host.getId());
        profile.put("ownerName", host.getOwnerName());
        profile.put("email", host.getEmail());
        profile.put("phone", host.getPhone());
        profile.put("companyName", host.getCompanyName());
        profile.put("businessAddress", host.getBusinessAddress());
        profile.put("kycDocumentUrl", host.getKycDocumentUrl());
        profile.put("payoutDetails", host.getPayoutDetails());
        profile.put("status", host.getStatus().toString());
        profile.put("createdAt", host.getCreatedAt());
        profile.put("updatedAt", host.getUpdatedAt());
        return profile;
    }

    // Request DTO for profile update
    public static class HostProfileUpdateRequest {
        private String ownerName;
        private String email; // Will be ignored in update
        private String phone;
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
}