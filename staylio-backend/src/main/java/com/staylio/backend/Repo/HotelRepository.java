package com.staylio.backend.Repo;

import com.staylio.backend.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

       // Find hotels by host
       List<Hotel> findByHostId(Long hostId);

       // Find active hotels
       List<Hotel> findByIsActiveTrue();

       // Find featured hotels
       List<Hotel> findByIsFeaturedTrue();

       // Find hotels by city
       List<Hotel> findByCityIgnoreCase(String city);

       // Find hotels by state
       List<Hotel> findByStateIgnoreCase(String state);

       // Find hotels by country
       List<Hotel> findByCountryIgnoreCase(String country);

       // Find hotels by city and active status
       List<Hotel> findByCityIgnoreCaseAndIsActiveTrue(String city);

       // Find hotels by price range
       @Query("SELECT h FROM Hotel h WHERE h.pricePerNight BETWEEN :minPrice AND :maxPrice AND h.isActive = true")
       List<Hotel> findByPriceRange(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice);

       // Find hotels by minimum rating
       @Query("SELECT h FROM Hotel h WHERE h.rating >= :minRating AND h.isActive = true")
       List<Hotel> findByMinimumRating(@Param("minRating") Double minRating);

       // Find hotels by guest capacity
       @Query("SELECT h FROM Hotel h WHERE h.maxGuests >= :guests AND h.isActive = true")
       List<Hotel> findByGuestCapacity(@Param("guests") Integer guests);

       // Search hotels by name or city
       @Query("SELECT h FROM Hotel h WHERE (LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(h.city) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND h.isActive = true")
       List<Hotel> searchHotels(@Param("keyword") String keyword);

       // Find hotels with available rooms
       @Query("SELECT h FROM Hotel h WHERE h.availableRooms > 0 AND h.isActive = true")
       List<Hotel> findHotelsWithAvailableRooms();

       // Find nearby hotels by coordinates
       @Query("SELECT h FROM Hotel h WHERE h.isActive = true AND " +
                     "(6371 * acos(cos(radians(:latitude)) * cos(radians(h.latitude)) * " +
                     "cos(radians(h.longitude) - radians(:longitude)) + sin(radians(:latitude)) * " +
                     "sin(radians(h.latitude)))) <= :radius")
       List<Hotel> findNearbyHotels(@Param("latitude") Double latitude,
                     @Param("longitude") Double longitude,
                     @Param("radius") Double radius);

       // Find hotels by owner
       List<Hotel> findByHotelOwnerId(Long hotelOwnerId);

       // Find hotels without owner (available for claiming)
       List<Hotel> findByHotelOwnerIdIsNull();

       // Search hotels for claiming (no owner, by name/city/id)
       @Query("SELECT h FROM Hotel h WHERE h.hotelOwnerId IS NULL AND " +
                     "(LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "LOWER(h.city) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                     "CAST(h.id AS string) LIKE CONCAT('%', :keyword, '%'))")
       List<Hotel> searchUnclaimedHotels(@Param("keyword") String keyword);

       // Smart filter for Chatbot
       @Query("SELECT h FROM Hotel h WHERE (:city IS NULL OR LOWER(h.city) LIKE LOWER(CONCAT('%', :city, '%'))) " +
                     "AND (:maxPrice IS NULL OR h.pricePerNight <= :maxPrice) " +
                     "AND (:minRating IS NULL OR h.rating >= :minRating) " +
                     "AND (:minGuests IS NULL OR h.maxGuests >= :minGuests) " +
                     "AND (:propertyType IS NULL OR LOWER(h.propertyType) = LOWER(:propertyType)) " +
                     "AND h.isActive = true")
       List<Hotel> findBySmartFilter(@Param("city") String city,
                     @Param("maxPrice") BigDecimal maxPrice,
                     @Param("minRating") Double minRating,
                     @Param("minGuests") Integer minGuests,
                     @Param("propertyType") String propertyType);

       // Landing Page: Claimed hotels only, top 15 by rating
       List<Hotel> findTop15ByHotelOwnerIdIsNotNullAndIsActiveTrueOrderByRatingDesc();

       // Main Page: All hotels, claimed first
       @Query("SELECT h FROM Hotel h ORDER BY CASE WHEN h.hotelOwnerId IS NOT NULL THEN 0 ELSE 1 END, h.rating DESC")
       List<Hotel> findAllSortedByClaimStatus();
}
