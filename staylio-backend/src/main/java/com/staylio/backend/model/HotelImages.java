package com.staylio.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "hotels_image")  // EXACT TABLE NAME
public class HotelImages {

    @Id
    @Column(name = "hotel_id")
    private Long hotelId;

    @Column(name = "photos_urls", columnDefinition = "TEXT")
    private String photosUrls;

    public Long getHotelId() {
        return hotelId;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public String getPhotosUrls() {
        return photosUrls;
    }

    public void setPhotosUrls(String photosUrls) {
        this.photosUrls = photosUrls;
    }
}
