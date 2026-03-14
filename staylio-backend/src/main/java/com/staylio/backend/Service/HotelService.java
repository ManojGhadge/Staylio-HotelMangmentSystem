package com.staylio.backend.Service;

import com.staylio.backend.Repo.HotelRepository;
import com.staylio.backend.model.Hotel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
@Transactional
public class HotelService {

    @Autowired
    private HotelRepository hotelRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String FLASK_AI_URL = "http://localhost:5000";

    // Create hotel
    public Hotel createHotel(Hotel hotel) {
        if (hotel.getId() == null) {
            hotel.setId(generateUniqueId());
        }
        return hotelRepository.save(hotel);
    }

    private Long generateUniqueId() {
        long id;
        do {
            // Generate a random 6-digit number (100000 to 999999)
            id = 100000L + (long) (Math.random() * 900000L);
        } while (hotelRepository.existsById(id));
        return id;
    }

    // Get all hotels
    public List<Hotel> getAllHotels() {
        return hotelRepository.findAllSortedByClaimStatus();
    }

    // Get landing page hotels
    public List<Hotel> getLandingPageHotels() {
        return hotelRepository.findTop15ByHotelOwnerIdIsNotNullAndIsActiveTrueOrderByRatingDesc();
    }

    // Get hotel by ID
    public Optional<Hotel> getHotelById(Long id) {
        return hotelRepository.findById(id);
    }

    // Update hotel
    public Hotel updateHotel(Long id, Hotel hotelDetails) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));

        hotel.setName(hotelDetails.getName());
        hotel.setDescription(hotelDetails.getDescription());
        hotel.setAddress(hotelDetails.getAddress());
        hotel.setCity(hotelDetails.getCity());
        hotel.setState(hotelDetails.getState());
        hotel.setCountry(hotelDetails.getCountry());
        hotel.setZipCode(hotelDetails.getZipCode());
        hotel.setLatitude(hotelDetails.getLatitude());
        hotel.setLongitude(hotelDetails.getLongitude());
        hotel.setPricePerNight(hotelDetails.getPricePerNight());
        hotel.setTotalRooms(hotelDetails.getTotalRooms());
        hotel.setAvailableRooms(hotelDetails.getAvailableRooms());
        hotel.setBedrooms(hotelDetails.getBedrooms());
        hotel.setBathrooms(hotelDetails.getBathrooms());
        hotel.setMaxGuests(hotelDetails.getMaxGuests());
        hotel.setPropertyType(hotelDetails.getPropertyType());
        hotel.setRoomTypes(hotelDetails.getRoomTypes());
        hotel.setAmenities(hotelDetails.getAmenities());
        hotel.setCheckInTime(hotelDetails.getCheckInTime());
        hotel.setCheckOutTime(hotelDetails.getCheckOutTime());
        hotel.setCancellationPolicy(hotelDetails.getCancellationPolicy());
        hotel.setHouseRules(hotelDetails.getHouseRules());
        hotel.setIsActive(hotelDetails.getIsActive());
        hotel.setIsFeatured(hotelDetails.getIsFeatured());

        return hotelRepository.save(hotel);
    }

    // Delete hotel
    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));
        hotelRepository.delete(hotel);
    }

    // Get hotels by host
    public List<Hotel> getHotelsByHost(Long hostId) {
        return hotelRepository.findByHostId(hostId);
    }

    // Get hotels by owner
    public List<Hotel> getHotelsByOwner(Long ownerId) {
        return hotelRepository.findByHotelOwnerId(ownerId);
    }

    // Get active hotels
    public List<Hotel> getActiveHotels() {
        return hotelRepository.findByIsActiveTrue();
    }

    // Get featured hotels
    public List<Hotel> getFeaturedHotels() {
        return hotelRepository.findByIsFeaturedTrue();
    }

    // Get hotels by city
    public List<Hotel> getHotelsByCity(String city) {
        return hotelRepository.findByCityIgnoreCaseAndIsActiveTrue(city);
    }

    // Get hotels by state
    public List<Hotel> getHotelsByState(String state) {
        return hotelRepository.findByStateIgnoreCase(state);
    }

    // Get hotels by country
    public List<Hotel> getHotelsByCountry(String country) {
        return hotelRepository.findByCountryIgnoreCase(country);
    }

    // Get hotels by price range
    public List<Hotel> getHotelsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return hotelRepository.findByPriceRange(minPrice, maxPrice);
    }

    // Get hotels by minimum rating
    public List<Hotel> getHotelsByMinimumRating(Double minRating) {
        return hotelRepository.findByMinimumRating(minRating);
    }

    // Get hotels by guest capacity
    public List<Hotel> getHotelsByGuestCapacity(Integer guests) {
        return hotelRepository.findByGuestCapacity(guests);
    }

    // Search hotels
    public List<Hotel> searchHotels(String keyword) {
        return hotelRepository.searchHotels(keyword);
    }

    // Get hotels with available rooms
    public List<Hotel> getHotelsWithAvailableRooms() {
        return hotelRepository.findHotelsWithAvailableRooms();
    }

    // Get nearby hotels
    public List<Hotel> getNearbyHotels(Double latitude, Double longitude, Double radius) {
        return hotelRepository.findNearbyHotels(latitude, longitude, radius);
    }

    // Update hotel rating
    public Hotel updateHotelRating(Long id, Double rating, Integer reviewCount) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));
        hotel.setRating(rating);
        hotel.setReviewCount(reviewCount);
        return hotelRepository.save(hotel);
    }

    // Get personalized recommendations from Flask AI service
    public List<Long> getPersonalizedRecommendations(Long userId, String city, Integer limit) {
        try {
            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("userId", userId);
            if (city != null && !city.trim().isEmpty()) {
                requestBody.put("city", city);
            }
            if (limit != null) {
                requestBody.put("limit", limit);
            }

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Create request entity
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            // Call Flask AI service
            ResponseEntity<String> response = restTemplate.postForEntity(
                FLASK_AI_URL + "/recommendations", 
                requestEntity, 
                String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                // Parse response
                Map<String, Object> responseBody = objectMapper.readValue(response.getBody(), Map.class);
                
                if (responseBody.containsKey("recommendations")) {
                    @SuppressWarnings("unchecked")
                    List<Integer> recommendations = (List<Integer>) responseBody.get("recommendations");
                    return recommendations.stream()
                        .map(Integer::longValue)
                        .collect(java.util.stream.Collectors.toList());
                }
            }

            return new ArrayList<>();

        } catch (Exception e) {
            System.err.println("Error calling Flask AI service for recommendations: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }
}
