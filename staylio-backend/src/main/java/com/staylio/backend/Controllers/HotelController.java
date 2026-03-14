package com.staylio.backend.Controllers;

import com.staylio.backend.Service.HotelService;
import com.staylio.backend.dto.HotelDTO;
import com.staylio.backend.model.Hotel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "*")
public class HotelController {

    @Autowired
    private HotelService hotelService;

    @Autowired
    private com.staylio.backend.Service.ReviewService reviewService;

    // Create hotel
    @PostMapping
    public ResponseEntity<?> createHotel(@RequestBody Hotel hotel) {
        try {
            Hotel createdHotel = hotelService.createHotel(hotel);
            return ResponseEntity.status(HttpStatus.CREATED).body(HotelDTO.fromEntity(createdHotel));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating hotel: " + e.getMessage());
        }
    }

    // Get all hotels
    @GetMapping
    public ResponseEntity<List<HotelDTO>> getAllHotels() {
        try {
            List<Hotel> hotels = hotelService.getAllHotels();
            List<HotelDTO> hotelDTOs = hotels.stream()
                    .map(HotelDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(hotelDTOs);
        } catch (Exception e) {
            e.printStackTrace(); // Log the actual error
            System.err.println("Error in getAllHotels: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get landing page hotels
    @GetMapping("/landing")
    public ResponseEntity<List<HotelDTO>> getLandingPageHotels() {
        try {
            List<Hotel> hotels = hotelService.getLandingPageHotels();
            List<HotelDTO> hotelDTOs = hotels.stream()
                    .map(HotelDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(hotelDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get hotel by ID
    @GetMapping("/{id}")
    public ResponseEntity<HotelDTO> getHotelById(@PathVariable Long id) {
        try {
            return hotelService.getHotelById(id)
                    .map(hotel -> ResponseEntity.ok(HotelDTO.fromEntity(hotel)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Update hotel
    @PutMapping("/{id}")
    public ResponseEntity<HotelDTO> updateHotel(@PathVariable Long id, @RequestBody Hotel hotel) {
        try {
            Hotel updatedHotel = hotelService.updateHotel(id, hotel);
            return ResponseEntity.ok(HotelDTO.fromEntity(updatedHotel));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete hotel
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id) {
        try {
            hotelService.deleteHotel(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get hotels by host
    @GetMapping("/host/{hostId}")
    public ResponseEntity<List<HotelDTO>> getHotelsByHost(@PathVariable Long hostId) {
        try {
            List<Hotel> hotels = hotelService.getHotelsByHost(hostId);
            List<HotelDTO> hotelDTOs = hotels.stream()
                    .map(HotelDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(hotelDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get hotels by owner
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<HotelDTO>> getHotelsByOwner(@PathVariable Long ownerId) {
        try {
            List<Hotel> hotels = hotelService.getHotelsByOwner(ownerId);
            List<HotelDTO> hotelDTOs = hotels.stream()
                    .map(HotelDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(hotelDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get active hotels
    @GetMapping("/active")
    public ResponseEntity<List<HotelDTO>> getActiveHotels() {
        try {
            List<Hotel> hotels = hotelService.getActiveHotels();
            List<HotelDTO> hotelDTOs = hotels.stream()
                    .map(HotelDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(hotelDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get featured hotels
    @GetMapping("/featured")
    public ResponseEntity<List<HotelDTO>> getFeaturedHotels() {
        try {
            List<Hotel> hotels = hotelService.getFeaturedHotels();
            List<HotelDTO> hotelDTOs = hotels.stream()
                    .map(HotelDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(hotelDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get hotels by city
    @GetMapping("/city/{city}")
    public ResponseEntity<List<HotelDTO>> getHotelsByCity(@PathVariable String city) {
        try {
            List<Hotel> hotels = hotelService.getHotelsByCity(city);
            List<HotelDTO> hotelDTOs = hotels.stream()
                    .map(HotelDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(hotelDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get hotels by state
    @GetMapping("/state/{state}")
    public ResponseEntity<List<HotelDTO>> getHotelsByState(@PathVariable String state) {
        try {
            List<Hotel> hotels = hotelService.getHotelsByState(state);
            List<HotelDTO> hotelDTOs = hotels.stream()
                    .map(HotelDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(hotelDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get hotels by country
    @GetMapping("/country/{country}")
    public ResponseEntity<List<HotelDTO>> getHotelsByCountry(@PathVariable String country) {
        try {
            List<Hotel> hotels = hotelService.getHotelsByCountry(country);
            List<HotelDTO> hotelDTOs = hotels.stream()
                    .map(HotelDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(hotelDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get hotels by price range
    @GetMapping("/price-range")
    public ResponseEntity<List<HotelDTO>> getHotelsByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice) {
        try {
            List<Hotel> hotels = hotelService.getHotelsByPriceRange(minPrice, maxPrice);
            List<HotelDTO> hotelDTOs = hotels.stream()
                    .map(HotelDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(hotelDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get hotels by minimum rating
    @GetMapping("/rating/{minRating}")
    public ResponseEntity<List<HotelDTO>> getHotelsByMinimumRating(@PathVariable Double minRating) {
        try {
            List<Hotel> hotels = hotelService.getHotelsByMinimumRating(minRating);
            List<HotelDTO> hotelDTOs = hotels.stream()
                    .map(HotelDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(hotelDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get hotels by guest capacity
    @GetMapping("/capacity/{guests}")
    public ResponseEntity<List<HotelDTO>> getHotelsByGuestCapacity(@PathVariable Integer guests) {
        try {
            List<Hotel> hotels = hotelService.getHotelsByGuestCapacity(guests);
            List<HotelDTO> hotelDTOs = hotels.stream()
                    .map(HotelDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(hotelDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Search hotels
    @GetMapping("/search")
    public ResponseEntity<List<HotelDTO>> searchHotels(@RequestParam String keyword) {
        try {
            List<Hotel> hotels = hotelService.searchHotels(keyword);
            List<HotelDTO> hotelDTOs = hotels.stream()
                    .map(HotelDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(hotelDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get hotels with available rooms
    @GetMapping("/available")
    public ResponseEntity<List<HotelDTO>> getHotelsWithAvailableRooms() {
        try {
            List<Hotel> hotels = hotelService.getHotelsWithAvailableRooms();
            List<HotelDTO> hotelDTOs = hotels.stream()
                    .map(HotelDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(hotelDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get nearby hotels
    @GetMapping("/nearby")
    public ResponseEntity<List<HotelDTO>> getNearbyHotels(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10.0") Double radius) {
        try {
            List<Hotel> hotels = hotelService.getNearbyHotels(latitude, longitude, radius);
            List<HotelDTO> hotelDTOs = hotels.stream()
                    .map(HotelDTO::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(hotelDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Check if hotel is claimed
    @GetMapping("/{id}/claim-status")
    public ResponseEntity<ClaimStatusResponse> getHotelClaimStatus(@PathVariable Long id) {
        try {
            return hotelService.getHotelById(id)
                    .map(hotel -> {
                        ClaimStatusResponse response = new ClaimStatusResponse();
                        response.setHotelId(hotel.getId());
                        response.setHotelOwnerId(hotel.getHotelOwnerId());
                        response.setClaimed(hotel.getHotelOwnerId() != null && hotel.getHotelOwnerId() > 0);
                        return ResponseEntity.ok(response);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Add Review with Eligibility Check
    @PostMapping("/{hotelId}/reviews")
    public ResponseEntity<?> addReview(@PathVariable Long hotelId,
            @RequestBody com.staylio.backend.model.Review review) {
        try {
            if (review.getUserId() == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User must be logged in.");
            }
            review.setHotelId(hotelId);

            if (!reviewService.canUserReview(hotelId, review.getUserId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You can only review a hotel after completing your stay.");
            }

            return ResponseEntity.ok(reviewService.addReview(review));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error adding review");
        }
    }

    // Check Review Eligibility
    @GetMapping("/{hotelId}/review-eligibility")
    public ResponseEntity<?> checkReviewEligibility(@PathVariable Long hotelId, @RequestParam Long userId) {
        try {
            boolean canReview = reviewService.canUserReview(hotelId, userId);
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("canReview", canReview);
            response.put("reason", canReview ? null : "COMPLETED_STAY_REQUIRED");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Inner class for claim status response
    public static class ClaimStatusResponse {
        private Long hotelId;
        private Long hotelOwnerId;
        private boolean claimed;

        public Long getHotelId() {
            return hotelId;
        }

        public void setHotelId(Long hotelId) {
            this.hotelId = hotelId;
        }

        public Long getHotelOwnerId() {
            return hotelOwnerId;
        }

        public void setHotelOwnerId(Long hotelOwnerId) {
            this.hotelOwnerId = hotelOwnerId;
        }

        public boolean isClaimed() {
            return claimed;
        }

        public void setClaimed(boolean claimed) {
            this.claimed = claimed;
        }
    }

    // Get personalized recommendations for user
    @PostMapping("/recommendations")
    public ResponseEntity<?> getPersonalizedRecommendations(@RequestBody RecommendationRequest request) {
        try {
            if (request.getUserId() == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }

            // Call Flask AI service for recommendations
            List<Long> recommendedHotelIds = hotelService.getPersonalizedRecommendations(
                request.getUserId(), 
                request.getCity(), 
                request.getLimit() != null ? request.getLimit() : 6
            );

            if (recommendedHotelIds.isEmpty()) {
                return ResponseEntity.ok(new RecommendationResponse(
                    java.util.Collections.emptyList(),
                    request.getCity(),
                    "No recommendations available. Try booking and reviewing hotels to get personalized suggestions!"
                ));
            }

            // Get hotel details for recommended IDs
            List<HotelDTO> recommendedHotels = recommendedHotelIds.stream()
                .map(hotelId -> hotelService.getHotelById(hotelId))
                .filter(java.util.Optional::isPresent)
                .map(java.util.Optional::get)
                .map(HotelDTO::fromEntity)
                .collect(Collectors.toList());

            String message = String.format("Found %d personalized recommendations%s", 
                recommendedHotels.size(), 
                request.getCity() != null ? " in " + request.getCity() : "");

            return ResponseEntity.ok(new RecommendationResponse(recommendedHotels, request.getCity(), message));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to get recommendations: " + e.getMessage());
        }
    }

    // Request DTO for recommendations
    public static class RecommendationRequest {
        private Long userId;
        private String city;
        private Integer limit;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        
        public Integer getLimit() { return limit; }
        public void setLimit(Integer limit) { this.limit = limit; }
    }

    // Response DTO for recommendations
    public static class RecommendationResponse {
        private List<HotelDTO> recommendations;
        private String city;
        private String message;

        public RecommendationResponse(List<HotelDTO> recommendations, String city, String message) {
            this.recommendations = recommendations;
            this.city = city;
            this.message = message;
        }

        public List<HotelDTO> getRecommendations() { return recommendations; }
        public void setRecommendations(List<HotelDTO> recommendations) { this.recommendations = recommendations; }
        
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
