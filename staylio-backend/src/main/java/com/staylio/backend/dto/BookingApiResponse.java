package com.staylio.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class BookingApiResponse {
    private boolean status;
    private String message;
    private long timestamp;
    private Data data;

    public static class Data {
        private List<HotelData> hotels;

        public List<HotelData> getHotels() {
            return hotels;
        }

        public void setHotels(List<HotelData> hotels) {
            this.hotels = hotels;
        }
    }

    public static class HotelData {
        @JsonProperty("hotel_id")
        private Long hotelId;
        
        private String accessibilityLabel;
        private Property property;

        public Long getHotelId() {
            return hotelId;
        }

        public void setHotelId(Long hotelId) {
            this.hotelId = hotelId;
        }

        public String getAccessibilityLabel() {
            return accessibilityLabel;
        }

        public void setAccessibilityLabel(String accessibilityLabel) {
            this.accessibilityLabel = accessibilityLabel;
        }

        public Property getProperty() {
            return property;
        }

        public void setProperty(Property property) {
            this.property = property;
        }
    }

    public static class Property {
        private String name;
        private Integer propertyClass;
        private Integer accuratePropertyClass;
        private Double reviewScore;
        private String reviewScoreWord;
        private Integer reviewCount;
        private Double latitude;
        private Double longitude;
        private String countryCode;
        private String currency;
        private PriceBreakdown priceBreakdown;
        private String checkinDate;
        private String checkoutDate;
        private CheckTime checkin;
        private CheckTime checkout;
        private List<String> photoUrls;
        private Long mainPhotoId;
        private Boolean isPreferred;
        private Boolean isPreferredPlus;
        private Boolean isFirstPage;
        private String wishlistName;
        private Integer ufi;
        private Integer position;
        private Integer rankingPosition;

        // Getters and Setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public Integer getPropertyClass() {
            return propertyClass;
        }

        public void setPropertyClass(Integer propertyClass) {
            this.propertyClass = propertyClass;
        }

        public Integer getAccuratePropertyClass() {
            return accuratePropertyClass;
        }

        public void setAccuratePropertyClass(Integer accuratePropertyClass) {
            this.accuratePropertyClass = accuratePropertyClass;
        }

        public Double getReviewScore() {
            return reviewScore;
        }

        public void setReviewScore(Double reviewScore) {
            this.reviewScore = reviewScore;
        }

        public String getReviewScoreWord() {
            return reviewScoreWord;
        }

        public void setReviewScoreWord(String reviewScoreWord) {
            this.reviewScoreWord = reviewScoreWord;
        }

        public Integer getReviewCount() {
            return reviewCount;
        }

        public void setReviewCount(Integer reviewCount) {
            this.reviewCount = reviewCount;
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

        public String getCountryCode() {
            return countryCode;
        }

        public void setCountryCode(String countryCode) {
            this.countryCode = countryCode;
        }

        public String getCurrency() {
            return currency;
        }

        public void setCurrency(String currency) {
            this.currency = currency;
        }

        public PriceBreakdown getPriceBreakdown() {
            return priceBreakdown;
        }

        public void setPriceBreakdown(PriceBreakdown priceBreakdown) {
            this.priceBreakdown = priceBreakdown;
        }

        public String getCheckinDate() {
            return checkinDate;
        }

        public void setCheckinDate(String checkinDate) {
            this.checkinDate = checkinDate;
        }

        public String getCheckoutDate() {
            return checkoutDate;
        }

        public void setCheckoutDate(String checkoutDate) {
            this.checkoutDate = checkoutDate;
        }

        public CheckTime getCheckin() {
            return checkin;
        }

        public void setCheckin(CheckTime checkin) {
            this.checkin = checkin;
        }

        public CheckTime getCheckout() {
            return checkout;
        }

        public void setCheckout(CheckTime checkout) {
            this.checkout = checkout;
        }

        public List<String> getPhotoUrls() {
            return photoUrls;
        }

        public void setPhotoUrls(List<String> photoUrls) {
            this.photoUrls = photoUrls;
        }

        public Long getMainPhotoId() {
            return mainPhotoId;
        }

        public void setMainPhotoId(Long mainPhotoId) {
            this.mainPhotoId = mainPhotoId;
        }

        public Boolean getIsPreferred() {
            return isPreferred;
        }

        public void setIsPreferred(Boolean isPreferred) {
            this.isPreferred = isPreferred;
        }

        public Boolean getIsPreferredPlus() {
            return isPreferredPlus;
        }

        public void setIsPreferredPlus(Boolean isPreferredPlus) {
            this.isPreferredPlus = isPreferredPlus;
        }

        public Boolean getIsFirstPage() {
            return isFirstPage;
        }

        public void setIsFirstPage(Boolean isFirstPage) {
            this.isFirstPage = isFirstPage;
        }

        public String getWishlistName() {
            return wishlistName;
        }

        public void setWishlistName(String wishlistName) {
            this.wishlistName = wishlistName;
        }

        public Integer getUfi() {
            return ufi;
        }

        public void setUfi(Integer ufi) {
            this.ufi = ufi;
        }

        public Integer getPosition() {
            return position;
        }

        public void setPosition(Integer position) {
            this.position = position;
        }

        public Integer getRankingPosition() {
            return rankingPosition;
        }

        public void setRankingPosition(Integer rankingPosition) {
            this.rankingPosition = rankingPosition;
        }
    }

    public static class PriceBreakdown {
        private Price grossPrice;
        private Price strikethroughPrice;
        private Price excludedPrice;

        public Price getGrossPrice() {
            return grossPrice;
        }

        public void setGrossPrice(Price grossPrice) {
            this.grossPrice = grossPrice;
        }

        public Price getStrikethroughPrice() {
            return strikethroughPrice;
        }

        public void setStrikethroughPrice(Price strikethroughPrice) {
            this.strikethroughPrice = strikethroughPrice;
        }

        public Price getExcludedPrice() {
            return excludedPrice;
        }

        public void setExcludedPrice(Price excludedPrice) {
            this.excludedPrice = excludedPrice;
        }
    }

    public static class Price {
        private String currency;
        private Double value;

        public String getCurrency() {
            return currency;
        }

        public void setCurrency(String currency) {
            this.currency = currency;
        }

        public Double getValue() {
            return value;
        }

        public void setValue(Double value) {
            this.value = value;
        }
    }

    public static class CheckTime {
        private String fromTime;
        private String untilTime;

        public String getFromTime() {
            return fromTime;
        }

        public void setFromTime(String fromTime) {
            this.fromTime = fromTime;
        }

        public String getUntilTime() {
            return untilTime;
        }

        public void setUntilTime(String untilTime) {
            this.untilTime = untilTime;
        }
    }

    // Main class getters and setters
    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public Data getData() {
        return data;
    }

    public void setData(Data data) {
        this.data = data;
    }
}
