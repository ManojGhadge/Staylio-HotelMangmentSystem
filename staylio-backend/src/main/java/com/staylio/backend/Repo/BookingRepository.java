package com.staylio.backend.Repo;

import com.staylio.backend.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

        // Find bookings by user ID
        List<Booking> findByUserId(Long userId);

        // Find bookings by hotel ID
        List<Booking> findByHotelId(Long hotelId);

        // Find bookings by status
        List<Booking> findByStatus(Booking.BookingStatus status);

        // Find booking by reference number
        Optional<Booking> findByBookingReference(String bookingReference);

        // Find bookings by user ID and status
        List<Booking> findByUserIdAndStatus(Long userId, Booking.BookingStatus status);

        // Find bookings by hotel ID and status
        List<Booking> findByHotelIdAndStatus(Long hotelId, Booking.BookingStatus status);

        // Find bookings by date range
        @Query("SELECT b FROM Booking b WHERE b.checkInDate >= :startDate AND b.checkOutDate <= :endDate")
        List<Booking> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

        // Find bookings by user and date range
        @Query("SELECT b FROM Booking b WHERE b.userId = :userId AND b.checkInDate >= :startDate AND b.checkOutDate <= :endDate")
        List<Booking> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        // Find bookings by hotel and date range
        @Query("SELECT b FROM Booking b WHERE b.hotelId = :hotelId AND b.checkInDate >= :startDate AND b.checkOutDate <= :endDate")
        List<Booking> findByHotelIdAndDateRange(@Param("hotelId") Long hotelId, @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        // Check for overlapping bookings (for availability check)
        @Query("SELECT b FROM Booking b WHERE b.hotelId = :hotelId AND b.status != 'CANCELLED' AND " +
                        "((b.checkInDate <= :checkOut AND b.checkOutDate >= :checkIn))")
        List<Booking> findOverlappingBookings(@Param("hotelId") Long hotelId,
                        @Param("checkIn") LocalDate checkIn,
                        @Param("checkOut") LocalDate checkOut);

        // Count bookings by user
        long countByUserId(Long userId);

        // Count bookings by hotel
        long countByHotelId(Long hotelId);

        // Count bookings by status
        long countByStatus(Booking.BookingStatus status);

        // Find bookings for hotels claimed by a specific host (approved claims only)
        @Query("SELECT b FROM Booking b WHERE b.hotelId IN " +
                        "(SELECT hc.hotelId FROM HotelClaim hc WHERE hc.hostId = :hostId AND hc.status = 'APPROVED')")
        List<Booking> findByHostClaimedHotels(@Param("hostId") Long hostId);

        // Check for eligible booking for review
        boolean existsByHotelIdAndUserIdAndStatusAndCheckOutDateBefore(Long hotelId, Long userId,
                        Booking.BookingStatus status, LocalDate date);

        // Find pending bookings past check-in date
        @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND b.checkInDate < :date")
        List<Booking> findPendingOverdueBookings(@Param("date") LocalDate date);

        // Find confirmed bookings past check-out date
        @Query("SELECT b FROM Booking b WHERE b.status = 'CONFIRMED' AND b.checkOutDate < :date")
        List<Booking> findConfirmedCompletedBookings(@Param("date") LocalDate date);
}