package com.staylio.backend.Controllers;

import com.staylio.backend.Service.ChatbotService;
import com.staylio.backend.dto.ChatbotRequest;
import com.staylio.backend.dto.ChatbotResponse;
import com.staylio.backend.dto.HotelDTO;
import com.staylio.backend.model.Hotel;
import com.staylio.backend.Repo.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chatbot")
@CrossOrigin(origins = "*")
public class ChatbotController {

    @Autowired
    private ChatbotService chatbotService;

    @Autowired
    private HotelRepository hotelRepository;

    @PostMapping("/query")
    public ResponseEntity<ChatbotResponse> query(@RequestBody ChatbotRequest request) {
        return ResponseEntity.ok(chatbotService.processQuery(request));
    }

    // Endpoint for the Python agent to call to search hotels
    @GetMapping("/search-hotels")
    public ResponseEntity<List<HotelDTO>> searchHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) Integer guests,
            @RequestParam(required = false) String propertyType) {

        // Handle explicit "null" or empty strings which might come from query params
        if (city != null && city.trim().isEmpty())
            city = null;
        if (propertyType != null && propertyType.trim().isEmpty())
            propertyType = null;

        List<Hotel> hotels = hotelRepository.findBySmartFilter(city, maxPrice, minRating, guests, propertyType);
        List<HotelDTO> dtos = hotels.stream()
                .limit(20) // Limit to top 20 candidates for AI scoring
                .map(HotelDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
