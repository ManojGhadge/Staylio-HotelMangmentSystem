package com.staylio.backend.dto;

import com.staylio.backend.model.Hotel;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class HotelDTO {
    private Long id;
    private Long hostId; // Added hostId field
    private Long hotelOwnerId;

    // ... existing getters and setters ...
    private String description;
    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private Double latitude;
    private Double longitude;
    private BigDecimal pricePerNight;
    private Integer totalRooms;
    private Integer availableRooms;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer maxGuests;
    private String propertyType;
    private String roomTypes;
    private String amenities;
    private String checkInTime;
    private String checkOutTime;
    private String cancellationPolicy;
    private String houseRules;
    private String allPhotoUrls;
    private Double rating;
    private Integer reviewCount;
    private Boolean isActive;
    private Boolean isFeatured;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> imageUrls;
    private String name; // Added name field

    // Constructors
    public HotelDTO() {
    }

    // Convert from Entity to DTO
    public static HotelDTO fromEntity(Hotel hotel) {
        HotelDTO dto = new HotelDTO();
        dto.setId(hotel.getId());
        dto.setHostId(hotel.getHostId());
        dto.setHotelOwnerId(hotel.getHotelOwnerId()); // Added hotelOwnerId setter
        dto.setName(hotel.getName());
        dto.setDescription(hotel.getDescription());
        dto.setAddress(hotel.getAddress());
        dto.setCity(hotel.getCity());
        dto.setState(hotel.getState());
        dto.setCountry(hotel.getCountry());
        dto.setZipCode(hotel.getZipCode());
        dto.setLatitude(hotel.getLatitude());
        dto.setLongitude(hotel.getLongitude());
        dto.setPricePerNight(hotel.getPricePerNight());
        dto.setTotalRooms(hotel.getTotalRooms());
        dto.setAvailableRooms(hotel.getAvailableRooms());
        dto.setBedrooms(hotel.getBedrooms());
        dto.setBathrooms(hotel.getBathrooms());
        dto.setMaxGuests(hotel.getMaxGuests());
        dto.setPropertyType(hotel.getPropertyType());
        dto.setRoomTypes(hotel.getRoomTypes());
        dto.setAmenities(hotel.getAmenities());
        dto.setCheckInTime(hotel.getCheckInTime());
        dto.setCheckOutTime(hotel.getCheckOutTime());
        dto.setCancellationPolicy(hotel.getCancellationPolicy());
        dto.setHouseRules(hotel.getHouseRules());
        dto.setAllPhotoUrls(hotel.getAllPhotoUrls());
        dto.setRating(hotel.getRating());
        dto.setReviewCount(hotel.getReviewCount());
        dto.setIsActive(hotel.getIsActive());
        dto.setIsFeatured(hotel.getIsFeatured());
        dto.setCreatedAt(hotel.getCreatedAt());
        dto.setUpdatedAt(hotel.getUpdatedAt());

        // Parse allPhotoUrls into imageUrls array
        if (hotel.getAllPhotoUrls() != null && !hotel.getAllPhotoUrls().isEmpty()) {
            List<String> imageUrls = java.util.Arrays.stream(hotel.getAllPhotoUrls().split(","))
                    .map(String::trim)
                    .filter(url -> !url.isEmpty())
                    .collect(Collectors.toList());
            dto.setImageUrls(imageUrls);
        } else {
            dto.setImageUrls(new java.util.ArrayList<>());
        }

        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getHostId() {
        return hostId;
    }

    public void setHostId(Long hostId) {
        this.hostId = hostId;
    }

    public Long getHotelOwnerId() {
        return hotelOwnerId;
    }

    public void setHotelOwnerId(Long hotelOwnerId) {
        this.hotelOwnerId = hotelOwnerId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }

    public Integer getTotalRooms() {
        return totalRooms;
    }

    public void setTotalRooms(Integer totalRooms) {
        this.totalRooms = totalRooms;
    }

    public Integer getAvailableRooms() {
        return availableRooms;
    }

    public void setAvailableRooms(Integer availableRooms) {
        this.availableRooms = availableRooms;
    }

    public Integer getBedrooms() {
        return bedrooms;
    }

    public void setBedrooms(Integer bedrooms) {
        this.bedrooms = bedrooms;
    }

    public Integer getBathrooms() {
        return bathrooms;
    }

    public void setBathrooms(Integer bathrooms) {
        this.bathrooms = bathrooms;
    }

    public Integer getMaxGuests() {
        return maxGuests;
    }

    public void setMaxGuests(Integer maxGuests) {
        this.maxGuests = maxGuests;
    }

    public String getPropertyType() {
        return propertyType;
    }

    public void setPropertyType(String propertyType) {
        this.propertyType = propertyType;
    }

    public String getRoomTypes() {
        return roomTypes;
    }

    public void setRoomTypes(String roomTypes) {
        this.roomTypes = roomTypes;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public String getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(String checkInTime) {
        this.checkInTime = checkInTime;
    }

    public String getCheckOutTime() {
        return checkOutTime;
    }

    public void setCheckOutTime(String checkOutTime) {
        this.checkOutTime = checkOutTime;
    }

    public String getCancellationPolicy() {
        return cancellationPolicy;
    }

    public void setCancellationPolicy(String cancellationPolicy) {
        this.cancellationPolicy = cancellationPolicy;
    }

    public String getHouseRules() {
        return houseRules;
    }

    public void setHouseRules(String houseRules) {
        this.houseRules = houseRules;
    }

    public String getAllPhotoUrls() {
        return allPhotoUrls;
    }

    public void setAllPhotoUrls(String allPhotoUrls) {
        this.allPhotoUrls = allPhotoUrls;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getIsFeatured() {
        return isFeatured;
    }

    public void setIsFeatured(Boolean isFeatured) {
        this.isFeatured = isFeatured;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }
}
