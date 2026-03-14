package com.staylio.backend.Controllers;

import com.staylio.backend.model.Hotel;
import com.staylio.backend.model.HotelClaim;
import com.staylio.backend.model.HotelClaim.ClaimStatus;
import com.staylio.backend.Repo.HotelRepository;
import com.staylio.backend.Service.HotelClaimService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotel-claims")
@CrossOrigin(origins = "*")
public class HotelClaimController {

    @Autowired
    private HotelClaimService hotelClaimService;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private com.staylio.backend.Service.EmailService emailService;

    @Autowired
    private com.staylio.backend.Repo.HostRepository hostRepository;

    // Search hotels available for claiming
    @GetMapping("/search-hotels")
    public ResponseEntity<Map<String, Object>> searchHotelsForClaiming(@RequestParam String keyword) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Hotel> hotels = hotelRepository.searchUnclaimedHotels(keyword);
            response.put("success", true);
            response.put("data", hotels);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error searching hotels: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get all unclaimed hotels
    @GetMapping("/unclaimed-hotels")
    public ResponseEntity<Map<String, Object>> getUnclaimedHotels() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Hotel> hotels = hotelRepository.findByHotelOwnerIdIsNull();
            response.put("success", true);
            response.put("data", hotels);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error fetching unclaimed hotels: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Submit a hotel claim
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitClaim(@RequestBody HotelClaim claim) {
        Map<String, Object> response = new HashMap<>();
        try {
            HotelClaim savedClaim = hotelClaimService.submitClaim(claim);

            // Send claim submission email
            try {
                var host = hostRepository.findById(savedClaim.getHostId());
                var hotel = hotelRepository.findById(savedClaim.getHotelId());

                if (host.isPresent() && hotel.isPresent()) {
                    emailService.sendHotelClaimSubmissionEmail(
                            host.get().getEmail(),
                            host.get().getOwnerName(),
                            hotel.get().getName());
                }
            } catch (Exception emailEx) {
                System.err.println("Failed to send hotel claim submission email: " + emailEx.getMessage());
            }

            response.put("success", true);
            response.put("message", "Hotel claim submitted successfully");
            response.put("data", savedClaim);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // Get claims by host
    @GetMapping("/host/{hostId}")
    public ResponseEntity<Map<String, Object>> getClaimsByHost(@PathVariable Long hostId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<HotelClaim> claims = hotelClaimService.getClaimsByHost(hostId);
            response.put("success", true);
            response.put("data", claims);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error fetching claims: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get all claims (Admin)
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllClaims() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<HotelClaim> claims = hotelClaimService.getAllClaims();
            response.put("success", true);
            response.put("data", claims);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error fetching claims: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Get pending claims (Admin)
    @GetMapping("/pending")
    public ResponseEntity<Map<String, Object>> getPendingClaims() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<HotelClaim> claims = hotelClaimService.getClaimsByStatus(ClaimStatus.PENDING_APPROVAL);
            response.put("success", true);
            response.put("data", claims);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error fetching pending claims: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Approve claim (Admin)
    @PutMapping("/{claimId}/approve")
    public ResponseEntity<Map<String, Object>> approveClaim(@PathVariable Long claimId) {
        Map<String, Object> response = new HashMap<>();
        try {
            HotelClaim claim = hotelClaimService.approveClaim(claimId);

            // Send approval email
            try {
                var host = hostRepository.findById(claim.getHostId());
                var hotel = hotelRepository.findById(claim.getHotelId());

                if (host.isPresent() && hotel.isPresent()) {
                    emailService.sendHotelClaimApprovalEmail(
                            host.get().getEmail(),
                            host.get().getOwnerName(),
                            hotel.get().getName());
                }
            } catch (Exception emailEx) {
                System.err.println("Failed to send hotel claim approval email: " + emailEx.getMessage());
            }

            response.put("success", true);
            response.put("message", "Claim approved successfully");
            response.put("data", claim);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // Reject claim (Admin)
    @PutMapping("/{claimId}/reject")
    public ResponseEntity<Map<String, Object>> rejectClaim(
            @PathVariable Long claimId,
            @RequestBody Map<String, String> requestBody) {
        Map<String, Object> response = new HashMap<>();
        try {
            String rejectionMessage = requestBody.get("rejectionMessage");
            if (rejectionMessage == null || rejectionMessage.trim().isEmpty()) {
                rejectionMessage = "Your claim has been rejected";
            }
            HotelClaim claim = hotelClaimService.rejectClaim(claimId, rejectionMessage);

            // Send rejection email
            try {
                var host = hostRepository.findById(claim.getHostId());
                var hotel = hotelRepository.findById(claim.getHotelId());

                if (host.isPresent() && hotel.isPresent()) {
                    emailService.sendHotelClaimRejectionEmail(
                            host.get().getEmail(),
                            host.get().getOwnerName(),
                            hotel.get().getName(),
                            rejectionMessage);
                }
            } catch (Exception emailEx) {
                System.err.println("Failed to send hotel claim rejection email: " + emailEx.getMessage());
            }

            response.put("success", true);
            response.put("message", "Claim rejected successfully");
            response.put("data", claim);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // Get hotels owned by host
    @GetMapping("/owned-hotels/{hostId}")
    public ResponseEntity<Map<String, Object>> getOwnedHotels(@PathVariable Long hostId) {
        Map<String, Object> response = new HashMap<>();
        try {
            List<Hotel> hotels = hotelRepository.findByHotelOwnerId(hostId);
            response.put("success", true);
            response.put("data", hotels);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error fetching owned hotels: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
