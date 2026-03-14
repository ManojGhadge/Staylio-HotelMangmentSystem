package com.staylio.backend.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hotel_img")
@CrossOrigin(origins = "*")
public class HotelImageController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @GetMapping("/{hotelId}")
    public ResponseEntity<List<String>> getHotelImages(@PathVariable Long hotelId) {
        System.out.println("Fetching images for hotel ID: " + hotelId);
        
        try {
            // Query hotels_image table for photos_urls
            String sql = "SELECT photos_urls FROM hotels_image WHERE hotel_id = ?";
            
            List<String> result = jdbcTemplate.query(sql, 
                new Object[]{hotelId},
                (rs, rowNum) -> rs.getString("photos_urls")
            );
            
            if (result.isEmpty()) {
                System.out.println("No images found in hotels_image table, trying hotels table...");
                // Fallback: try to get from hotels table all_photo_urls
                String fallbackSql = "SELECT all_photo_urls FROM hotels WHERE id = ?";
                result = jdbcTemplate.query(fallbackSql,
                    new Object[]{hotelId},
                    (rs, rowNum) -> rs.getString("all_photo_urls")
                );
            }
            
            if (!result.isEmpty() && result.get(0) != null) {
                // Split comma-separated URLs and clean them
                List<String> imageUrls = Arrays.stream(result.get(0).split(","))
                    .map(String::trim)
                    .filter(url -> !url.isEmpty())
                    .collect(Collectors.toList());
                
                System.out.println("Found " + imageUrls.size() + " images for hotel " + hotelId);
                return ResponseEntity.ok(imageUrls);
            }
            
            System.out.println("No images found for hotel " + hotelId);
            // Return empty array if no images found
            return ResponseEntity.ok(new ArrayList<>());
            
        } catch (Exception e) {
            System.err.println("Error fetching images for hotel " + hotelId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
}
