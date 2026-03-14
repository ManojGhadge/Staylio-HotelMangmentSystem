package com.staylio.backend.Repo;

import com.staylio.backend.model.HotelClaim;
import com.staylio.backend.model.HotelClaim.ClaimStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelClaimRepository extends JpaRepository<HotelClaim, Long> {
    
    List<HotelClaim> findByHostId(Long hostId);
    
    List<HotelClaim> findByStatus(ClaimStatus status);
    
    Optional<HotelClaim> findByHostIdAndHotelIdAndStatus(Long hostId, Long hotelId, ClaimStatus status);
    
    boolean existsByHotelIdAndStatus(Long hotelId, ClaimStatus status);
}
