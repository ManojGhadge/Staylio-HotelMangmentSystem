package com.staylio.backend.Service;

import com.staylio.backend.model.Booking;
import com.staylio.backend.model.Hotel;
import com.staylio.backend.model.User;
import com.staylio.backend.model.Host;
import com.staylio.backend.model.Room;
import org.springframework.transaction.annotation.Transactional;
import com.staylio.backend.Repo.BookingRepository;
import com.staylio.backend.Repo.HotelRepository;
import com.staylio.backend.Repo.UserRepository;
import com.staylio.backend.Repo.HostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private HostRepository hostRepository;

    @Autowired
    private com.staylio.backend.Repo.RoomRepository roomRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private WalletService walletService;

    // Get all bookings
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // Get booking by ID
    public Booking getBookingById(Long id) {
        Optional<Booking> booking = bookingRepository.findById(id);
        if (booking.isPresent()) {
            return booking.get();
        } else {
            throw new RuntimeException("Booking not found with id: " + id);
        }
    }

    // Get booking by reference
    public Booking getBookingByReference(String reference) {
        Optional<Booking> booking = bookingRepository.findByBookingReference(reference);
        if (booking.isPresent()) {
            return booking.get();
        } else {
            throw new RuntimeException("Booking not found with reference: " + reference);
        }
    }

    // Get bookings by user ID
    public List<Booking> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId);
    }

    // Get bookings by hotel ID
    public List<Booking> getBookingsByHotelId(Long hotelId) {
        return bookingRepository.findByHotelId(hotelId);
    }

    // Get bookings by status
    public List<Booking> getBookingsByStatus(Booking.BookingStatus status) {
        return bookingRepository.findByStatus(status);
    }

    // Get bookings for hotels claimed by a specific host (approved claims only)
    public List<Booking> getBookingsByHostClaimedHotels(Long hostId) {
        return bookingRepository.findByHostClaimedHotels(hostId);
    }

    // Create new booking
    @Transactional
    public Booking createBooking(Booking booking) {
        // Validate user exists (optional - allow guest bookings)
        if (booking.getUserId() != null) {
            Optional<User> user = userRepository.findById(booking.getUserId());
            if (!user.isPresent()) {
                throw new RuntimeException("User not found with id: " + booking.getUserId());
            }
        }

        // Validate hotel exists
        Optional<Hotel> hotel = hotelRepository.findById(booking.getHotelId());
        if (!hotel.isPresent()) {
            throw new RuntimeException("Hotel not found with id: " + booking.getHotelId());
        }

        // Validate dates
        if (booking.getCheckInDate().isAfter(booking.getCheckOutDate())) {
            throw new RuntimeException("Check-in date must be before check-out date");
        }

        if (booking.getCheckInDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Check-in date cannot be in the past");
        }

        // Calculate total nights if not provided
        if (booking.getTotalNights() == null) {
            long nights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
            booking.setTotalNights((int) nights);
        }

        // Set price per night from hotel if not provided
        // Set price per night from hotel if not provided or zero
        if (booking.getPricePerNight() == null || booking.getPricePerNight().compareTo(BigDecimal.ZERO) <= 0) {
            booking.setPricePerNight(hotel.get().getPricePerNight());
        }

        // Calculate total amount if not provided or zero
        if (booking.getTotalAmount() == null || booking.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            BigDecimal subtotal = booking.getPricePerNight()
                    .multiply(BigDecimal.valueOf(booking.getTotalNights()))
                    .multiply(BigDecimal.valueOf(booking.getRooms()));
            // Tax 10%
            BigDecimal tax = subtotal.multiply(new BigDecimal("0.10"));
            booking.setTotalAmount(subtotal.add(tax));
        }

        // Check availability (basic check - can be enhanced)
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(
                booking.getHotelId(), booking.getCheckInDate(), booking.getCheckOutDate());

        // Inventory Count Update
        if (booking.getRoomType() != null) {
            Optional<Room> roomOpt = roomRepository.findByHotelIdAndRoomType(booking.getHotelId(),
                    booking.getRoomType());
            if (roomOpt.isPresent()) {
                Room room = roomOpt.get();
                if (room.getRoomCount() <= 0) {
                    throw new IllegalStateException("This room is no longer available.");
                }
                room.setRoomCount(room.getRoomCount() - 1);
                roomRepository.save(room);
            }
        }

        Booking savedBooking = bookingRepository.save(booking);

        // Send Confirmation Email
        if (savedBooking.getGuestEmail() != null) {
            try {
                emailService.sendBookingConfirmationEmail(
                        savedBooking.getGuestEmail(),
                        savedBooking.getGuestName(),
                        hotel.get().getName(),
                        savedBooking.getBookingReference() != null ? savedBooking.getBookingReference()
                                : "BK-" + savedBooking.getId(),
                        savedBooking.getCheckInDate().toString(),
                        savedBooking.getCheckOutDate().toString(),
                        savedBooking.getTotalAmount().toString(),
                        hotel.get().getAddress(),
                        hotel.get().getCity(),
                        hotel.get().getCountry());
            } catch (Exception e) {
                // Log error but don't fail the booking
                System.out.println("Failed to send booking confirmation email: " + e.getMessage());
            }
        }

        return savedBooking;
    }

    // Update booking
    public Booking updateBooking(Long id, Booking bookingDetails) {
        Booking existingBooking = getBookingById(id);

        // Update allowed fields (some fields shouldn't be updated after creation)
        if (bookingDetails.getGuestName() != null) {
            existingBooking.setGuestName(bookingDetails.getGuestName());
        }
        if (bookingDetails.getGuestEmail() != null) {
            existingBooking.setGuestEmail(bookingDetails.getGuestEmail());
        }
        if (bookingDetails.getGuestPhone() != null) {
            existingBooking.setGuestPhone(bookingDetails.getGuestPhone());
        }
        if (bookingDetails.getSpecialRequests() != null) {
            existingBooking.setSpecialRequests(bookingDetails.getSpecialRequests());
        }
        if (bookingDetails.getStatus() != null) {
            existingBooking.setStatus(bookingDetails.getStatus());
        }

        return bookingRepository.save(existingBooking);
    }

    // Update booking status
    public Booking updateBookingStatus(Long id, Booking.BookingStatus status) {
        Booking booking = getBookingById(id);
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }

    // Handle Payment Success / Update Details
    @Transactional
    public void updatePaymentDetails(Long bookingId, String paymentStatus, String paymentId) {
        Booking booking = getBookingById(bookingId);

        boolean wasNotSuccess = !"SUCCESS".equalsIgnoreCase(booking.getPaymentStatus());

        booking.setPaymentStatus(paymentStatus);
        if (paymentId != null) {
            booking.setRazorpayPaymentId(paymentId);
        }
        bookingRepository.save(booking);

        // Process Wallet only if:
        // 1. It's a new SUCCESS status
        // 2. It's NOT a manual host confirmation (Pay at Hotel)
        if (wasNotSuccess && "SUCCESS".equalsIgnoreCase(paymentStatus)) {
            if (paymentId != null && !paymentId.contains("MANUAL")) {
                walletService.processOnlinePayment(booking.getUserId(), booking.getTotalAmount(), booking.getId());
            }
        }
    }

    // Deprecated: use updatePaymentDetails
    @Transactional
    public void handlePaymentSuccess(Long bookingId) {
        updatePaymentDetails(bookingId, "SUCCESS", null);
    }

    // Cancel booking with Standard Cancellation Policy
    @Transactional
    public Booking cancelBooking(Long id) {
        Booking booking = getBookingById(id);

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            return booking; // Already cancelled
        }

        // Strict Rule: Cannot cancel COMPLETED bookings
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new IllegalStateException("Cannot cancel a completed booking.");
        }

        // Strict Rule: Must be before check-in date
        if (!LocalDate.now().isBefore(booking.getCheckInDate())) {
            throw new IllegalStateException("Cannot cancel booking on or after check-in date.");
        }

        // Increment Inventory
        if (booking.getRoomType() != null) {
            Optional<Room> roomOpt = roomRepository.findByHotelIdAndRoomType(booking.getHotelId(),
                    booking.getRoomType());
            if (roomOpt.isPresent()) {
                Room room = roomOpt.get();
                room.setRoomCount(room.getRoomCount() + 1);
                roomRepository.save(room);
            }
        }

        // Determine Refund Status - Standard Policy: 24h notice
        LocalDate checkIn = booking.getCheckInDate();
        LocalDate now = LocalDate.now();
        // Assuming check-in is at 2 PM, we can be more precise with LocalDateTime if
        // needed.
        // For simplicity, using Date comparison.
        long daysUntilCheckIn = ChronoUnit.DAYS.between(now, checkIn);

        String refundStatus;
        if (daysUntilCheckIn >= 1) { // More than 24 hours (roughly)
            refundStatus = "Full Refund Initiated (Standard Policy: >24h notice)";

            // Refund Logic
            // Only if payment was made (Online)
            if ("SUCCESS".equalsIgnoreCase(booking.getPaymentStatus())
                    || "PAID".equalsIgnoreCase(booking.getPaymentStatus())) {
                try {
                    walletService.processRefund(booking.getUserId(), booking.getTotalAmount(), booking.getId());
                    refundStatus += " - Amount Credited to Wallet";
                } catch (Exception e) {
                    refundStatus += " - Refund Failed: " + e.getMessage();
                }
            }

        } else {
            refundStatus = "Non-Refundable (Standard Policy: <24h notice)";
        }

        // Update Status
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Booking savedBooking = bookingRepository.save(booking);

        // Notify Guest
        if (booking.getGuestEmail() != null) {
            Optional<Hotel> hotel = hotelRepository.findById(booking.getHotelId());
            String hotelName = hotel.map(Hotel::getName).orElse("StayLio Property");
            emailService.sendBookingCancellationEmailToGuest(
                    booking.getGuestEmail(),
                    booking.getGuestName(),
                    hotelName,
                    booking.getBookingReference() != null ? savedBooking.getBookingReference()
                            : "BK-" + savedBooking.getId(),
                    refundStatus);
        }

        // Notify Host
        if (booking.getHotelId() != null) {
            Optional<Hotel> hotel = hotelRepository.findById(booking.getHotelId());
            if (hotel.isPresent()) {
                Long hostId = hotel.get().getHostId();
                if (hostId != null) {
                    Optional<Host> host = hostRepository.findById(hostId);
                    if (host.isPresent()) {
                        emailService.sendBookingCancellationEmailToHost(
                                host.get().getEmail(),
                                host.get().getOwnerName(),
                                booking.getBookingReference() != null ? booking.getBookingReference()
                                        : "BK-" + booking.getId(),
                                booking.getGuestName(),
                                hotel.get().getName());
                    }
                }
            }
        }

        return savedBooking;
    }

    // Confirm booking (Host Action)
    public Booking confirmBooking(Long id) {
        Booking booking = getBookingById(id);

        // Strict Transition Rule: PENDING -> CONFIRMED
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new IllegalStateException("Only PENDING bookings can be confirmed.");
        }

        // Strict Rule: Payment must be SUCCESS
        // Note: checking for "SUCCESS" (case-insensitive) as per requirement
        if (!"SUCCESS".equalsIgnoreCase(booking.getPaymentStatus())) {
            throw new IllegalStateException("Cannot confirm booking without successful payment.");
        }

        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        booking.setUpdatedAt(java.time.LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    // Auto-Cancel Overdue Pending Bookings (System Logic)
    public void autoCancelOverdueBookings() {
        List<Booking> overdueBookings = bookingRepository.findPendingOverdueBookings(LocalDate.now());
        for (Booking booking : overdueBookings) {
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            booking.setUpdatedAt(java.time.LocalDateTime.now());
            // No refund needed for pending (unpaid/unconfirmed) usually, or handle logic
            bookingRepository.save(booking);
            System.out.println("Auto-cancelled overdue pending booking: " + booking.getId());
        }
    }

    // Auto-Complete Finished Bookings (System Logic)
    public void autoCompleteFinishedBookings() {
        List<Booking> finishedBookings = bookingRepository.findConfirmedCompletedBookings(LocalDate.now());
        for (Booking booking : finishedBookings) {
            try {
                booking.setStatus(Booking.BookingStatus.COMPLETED);
                booking.setUpdatedAt(java.time.LocalDateTime.now());
                bookingRepository.save(booking);

                // Settlement Logic
                // Only if payment was SUCCESS/PAID (Online) - Pay at Hotel doesn't need
                // settlement from Admin
                if ("SUCCESS".equalsIgnoreCase(booking.getPaymentStatus())
                        || "PAID".equalsIgnoreCase(booking.getPaymentStatus())) {
                    Optional<Hotel> hotelOpt = hotelRepository.findById(booking.getHotelId());
                    if (hotelOpt.isPresent()) {
                        Long hostId = hotelOpt.get().getHostId();
                        if (hostId != null) {
                            walletService.processHostSettlement(hostId, booking.getTotalAmount(), booking.getId());
                            System.out.println("Settlement processed for booking: " + booking.getId());
                        }
                    }
                }

                System.out.println("Auto-completed finished booking: " + booking.getId());
            } catch (Exception e) {
                System.err.println("Error auto-completing booking " + booking.getId() + ": " + e.getMessage());
            }
        }
    }

    // Delete booking
    public void deleteBooking(Long id) {
        Booking booking = getBookingById(id);
        bookingRepository.delete(booking);
    }

    // Check availability for a hotel on given dates
    public boolean checkAvailability(Long hotelId, LocalDate checkIn, LocalDate checkOut, Integer rooms) {
        List<Booking> overlappingBookings = bookingRepository.findOverlappingBookings(hotelId, checkIn, checkOut);

        // Simple availability check - in a real system, you'd check actual room
        // inventory
        // For now, assume hotel has unlimited rooms or implement basic logic
        return overlappingBookings.size() < 10; // Arbitrary limit for demo
    }

    // Get booking statistics
    public BookingStats getBookingStats() {
        long totalBookings = bookingRepository.count();
        long pendingBookings = bookingRepository.countByStatus(Booking.BookingStatus.PENDING);
        long confirmedBookings = bookingRepository.countByStatus(Booking.BookingStatus.CONFIRMED);
        long cancelledBookings = bookingRepository.countByStatus(Booking.BookingStatus.CANCELLED);

        return new BookingStats(totalBookings, pendingBookings, confirmedBookings, cancelledBookings);
    }

    // Inner class for booking statistics
    public static class BookingStats {
        private long totalBookings;
        private long pendingBookings;
        private long confirmedBookings;
        private long cancelledBookings;

        public BookingStats(long totalBookings, long pendingBookings, long confirmedBookings, long cancelledBookings) {
            this.totalBookings = totalBookings;
            this.pendingBookings = pendingBookings;
            this.confirmedBookings = confirmedBookings;
            this.cancelledBookings = cancelledBookings;
        }

        // Getters
        public long getTotalBookings() {
            return totalBookings;
        }

        public long getPendingBookings() {
            return pendingBookings;
        }

        public long getConfirmedBookings() {
            return confirmedBookings;
        }

        public long getCancelledBookings() {
            return cancelledBookings;
        }
    }
}