package com.staylio.backend.Service;

import com.staylio.backend.model.Hotel;
import com.staylio.backend.model.HotelClaim;
import com.staylio.backend.model.HotelClaim.ClaimStatus;
import com.staylio.backend.Repo.HotelClaimRepository;
import com.staylio.backend.Repo.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class HotelClaimService {
    
    @Autowired
    private HotelClaimRepository hotelClaimRepository;
    
    @Autowired
    private HotelRepository hotelRepository;
    
    // Submit a new hotel claim
    @Transactional
    public HotelClaim submitClaim(HotelClaim claim) {
        // Validate hotel exists
        Optional<Hotel> hotel = hotelRepository.findById(claim.getHotelId());
        if (hotel.isEmpty()) {
            throw new RuntimeException("Hotel not found");
        }
        
        // Check if hotel is already claimed
        if (hotel.get().getHotelOwnerId() != null) {
            throw new RuntimeException("Hotel is already claimed by another host");
        }
        
        // Check if there's already a pending claim for this hotel by this host
        Optional<HotelClaim> existingClaim = hotelClaimRepository.findByHostIdAndHotelIdAndStatus(
            claim.getHostId(), claim.getHotelId(), ClaimStatus.PENDING_APPROVAL
        );
        
        if (existingClaim.isPresent()) {
            throw new RuntimeException("You already have a pending claim for this hotel");
        }
        
        // Check if there's any pending claim for this hotel
        boolean hasPendingClaim = hotelClaimRepository.existsByHotelIdAndStatus(
            claim.getHotelId(), ClaimStatus.PENDING_APPROVAL
        );
        
        if (hasPendingClaim) {
            throw new RuntimeException("This hotel already has a pending claim from another host");
        }
        
        claim.setStatus(ClaimStatus.PENDING_APPROVAL);
        return hotelClaimRepository.save(claim);
    }
    
    // Get all claims
    public List<HotelClaim> getAllClaims() {
        return hotelClaimRepository.findAll();
    }
    
    // Get claims by host
    public List<HotelClaim> getClaimsByHost(Long hostId) {
        return hotelClaimRepository.findByHostId(hostId);
    }
    
    // Get claims by status
    public List<HotelClaim> getClaimsByStatus(ClaimStatus status) {
        return hotelClaimRepository.findByStatus(status);
    }
    
    // Get claim by ID
    public Optional<HotelClaim> getClaimById(Long id) {
        return hotelClaimRepository.findById(id);
    }
    
    // Approve claim
    @Transactional
    public HotelClaim approveClaim(Long claimId) {
        Optional<HotelClaim> claimOpt = hotelClaimRepository.findById(claimId);
        if (claimOpt.isEmpty()) {
            throw new RuntimeException("Claim not found");
        }
        
        HotelClaim claim = claimOpt.get();
        
        // Validate claim is pending
        if (claim.getStatus() != ClaimStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Only pending claims can be approved");
        }
        
        // Get the hotel
        Optional<Hotel> hotelOpt = hotelRepository.findById(claim.getHotelId());
        if (hotelOpt.isEmpty()) {
            throw new RuntimeException("Hotel not found");
        }
        
        Hotel hotel = hotelOpt.get();
        
        // Check if hotel is already claimed
        if (hotel.getHotelOwnerId() != null) {
            throw new RuntimeException("Hotel is already claimed by another host");
        }
        
        // Validate hotel has required fields (to prevent not-null constraint violations)
        if (hotel.getAddress() == null || hotel.getAddress().trim().isEmpty()) {
            throw new RuntimeException("Hotel data is incomplete. Address is required.");
        }
        if (hotel.getCity() == null || hotel.getCity().trim().isEmpty()) {
            throw new RuntimeException("Hotel data is incomplete. City is required.");
        }
        if (hotel.getCountry() == null || hotel.getCountry().trim().isEmpty()) {
            throw new RuntimeException("Hotel data is incomplete. Country is required.");
        }
        
        // Update claim status
        claim.setStatus(ClaimStatus.APPROVED);
        claim.setReviewedAt(LocalDateTime.now());
        hotelClaimRepository.save(claim);
        
        // Assign hotel to host
        hotel.setHotelOwnerId(claim.getHostId());
        hotelRepository.save(hotel);
        
        return claim;
    }
    
    // Reject claim
    @Transactional
    public HotelClaim rejectClaim(Long claimId, String rejectionMessage) {
        Optional<HotelClaim> claimOpt = hotelClaimRepository.findById(claimId);
        if (claimOpt.isEmpty()) {
            throw new RuntimeException("Claim not found");
        }
        
        HotelClaim claim = claimOpt.get();
        
        // Validate claim is pending
        if (claim.getStatus() != ClaimStatus.PENDING_APPROVAL) {
            throw new RuntimeException("Only pending claims can be rejected");
        }
        
        // Update claim status
        claim.setStatus(ClaimStatus.REJECTED);
        claim.setRejectionMessage(rejectionMessage);
        claim.setReviewedAt(LocalDateTime.now());
        
        return hotelClaimRepository.save(claim);
    }
    
    // Remove hotel owner (when host is removed)
    @Transactional
    public void removeHotelOwner(Long hostId) {
        List<Hotel> ownedHotels = hotelRepository.findByHotelOwnerId(hostId);
        for (Hotel hotel : ownedHotels) {
            hotel.setHotelOwnerId(null);
            hotelRepository.save(hotel);
        }
    }
}
