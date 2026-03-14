package com.staylio.backend.Service;

import com.staylio.backend.Repo.HotelRepository;
import com.staylio.backend.Repo.ReviewRepository;
import com.staylio.backend.model.Hotel;
import com.staylio.backend.model.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private com.staylio.backend.Repo.BookingRepository bookingRepository;

    public boolean canUserReview(Long hotelId, Long userId) {
        return bookingRepository.existsByHotelIdAndUserIdAndStatusAndCheckOutDateBefore(
                hotelId,
                userId,
                com.staylio.backend.model.Booking.BookingStatus.COMPLETED,
                java.time.LocalDate.now());
    }

    public List<Review> getReviewsByHotelId(Long hotelId) {
        return reviewRepository.findByHotelIdOrderByCreatedAtDesc(hotelId);
    }

    @Transactional
    public Review addReview(Review review) {
        if (!canUserReview(review.getHotelId(), review.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You can only review a hotel after completing your stay.");
        }
        Review savedReview = reviewRepository.save(review);
        recalculateHotelRating(review.getHotelId());
        return savedReview;
    }

    public void recalculateHotelRating(Long hotelId) {
        Double averageRating = reviewRepository.getAverageRatingByHotelId(hotelId);
        if (averageRating == null) {
            averageRating = 0.0;
        }

        // Round to 1 decimal place
        averageRating = Math.round(averageRating * 10.0) / 10.0;

        long count = reviewRepository.countByHotelId(hotelId);

        Hotel hotel = hotelRepository.findById(hotelId).orElse(null);
        if (hotel != null) {
            hotel.setRating(averageRating);
            hotel.setReviewCount((int) count);
            hotelRepository.save(hotel);
        }
    }
}
