package com.staylio.backend.Controllers;

import com.staylio.backend.model.Booking;
import com.staylio.backend.Service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    // Get all bookings
    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        try {
            List<Booking> bookings = bookingService.getAllBookings();
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        try {
            Booking booking = bookingService.getBookingById(id);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get booking by reference
    @GetMapping("/reference/{reference}")
    public ResponseEntity<Booking> getBookingByReference(@PathVariable String reference) {
        try {
            Booking booking = bookingService.getBookingByReference(reference);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get bookings by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Booking>> getBookingsByUserId(@PathVariable Long userId) {
        try {
            List<Booking> bookings = bookingService.getBookingsByUserId(userId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get bookings by hotel ID
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<Booking>> getBookingsByHotelId(@PathVariable Long hotelId) {
        try {
            List<Booking> bookings = bookingService.getBookingsByHotelId(hotelId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get bookings by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Booking>> getBookingsByStatus(@PathVariable String status) {
        try {
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            List<Booking> bookings = bookingService.getBookingsByStatus(bookingStatus);
            return ResponseEntity.ok(bookings);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get bookings for hotels claimed by host
    @GetMapping("/host/{hostId}")
    public ResponseEntity<List<Booking>> getBookingsByHostId(@PathVariable Long hostId) {
        try {
            List<Booking> bookings = bookingService.getBookingsByHostClaimedHotels(hostId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create new booking
    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(@RequestBody BookingRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Create booking from request
            Booking booking = new Booking();
            booking.setUserId(request.getUserId());
            booking.setHotelId(request.getHotelId());
            booking.setGuestName(request.getGuestName());
            booking.setGuestEmail(request.getGuestEmail());
            booking.setGuestPhone(request.getGuestPhone());
            booking.setCheckInDate(request.getCheckInDate());
            booking.setCheckOutDate(request.getCheckOutDate());
            booking.setGuests(request.getGuests());
            booking.setRooms(request.getRooms());
            booking.setRoomType(request.getRoomType());
            booking.setSpecialRequests(request.getSpecialRequests());
            booking.setPricePerNight(request.getPricePerNight());
            booking.setTotalAmount(request.getTotalAmount());
            booking.setTotalNights(request.getTotalNights());
            booking.setPaymentMethod(request.getPaymentMethod());

            // Map payment details from request
            // We DO NOT set paymentStatus initially so it defaults to null/PENDING
            // This ensures state transition logic in updatePaymentDetails triggers the
            // wallet
            if (request.getRazorpayPaymentId() != null) {
                booking.setRazorpayPaymentId(request.getRazorpayPaymentId());
            }

            // Auto-confirm if "Pay at Hotel" logic removed to ensure host confirmation
            // Booking remains PENDING until host confirms
            // if (request.getPaymentMethod() != null && ... ) { ... }

            Booking createdBooking = bookingService.createBooking(booking);

            // Trigger Wallet if created with SUCCESS payment (Online)
            if (request.getPaymentStatus() != null &&
                    ("SUCCESS".equalsIgnoreCase(request.getPaymentStatus())
                            || "PAID".equalsIgnoreCase(request.getPaymentStatus()))) {

                if (booking.getRazorpayPaymentId() != null && !booking.getRazorpayPaymentId().contains("MANUAL")) {
                    try {
                        // This will transition paymentStatus from null -> SUCCESS and trigger wallet
                        bookingService.updatePaymentDetails(createdBooking.getId(), "SUCCESS",
                                booking.getRazorpayPaymentId());
                        createdBooking.setPaymentStatus("SUCCESS");
                    } catch (Exception e) {
                        System.err.println("Failed to process wallet for new booking: " + e.getMessage());
                    }
                } else {
                    // For manual payments, set status directly via service
                    bookingService.updatePaymentDetails(createdBooking.getId(), request.getPaymentStatus(),
                            booking.getRazorpayPaymentId());
                    createdBooking.setPaymentStatus(request.getPaymentStatus());
                }
            } else if (request.getPaymentStatus() != null) {
                createdBooking.setPaymentStatus(request.getPaymentStatus());
                bookingService.updateBooking(createdBooking.getId(), createdBooking);
            }

            response.put("success", true);
            response.put("message", "Booking created successfully");
            response.put("booking", createdBooking);
            response.put("bookingReference", createdBooking.getBookingReference());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Booking creation failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Update booking
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateBooking(@PathVariable Long id,
            @RequestBody Booking bookingDetails) {
        Map<String, Object> response = new HashMap<>();

        try {
            Booking updatedBooking = bookingService.updateBooking(id, bookingDetails);

            response.put("success", true);
            response.put("message", "Booking updated successfully");
            response.put("booking", updatedBooking);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Booking update failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Update booking status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateBookingStatus(@PathVariable Long id, @RequestParam String status) {
        Map<String, Object> response = new HashMap<>();

        try {
            Booking.BookingStatus bookingStatus = Booking.BookingStatus.valueOf(status.toUpperCase());
            Booking updatedBooking = bookingService.updateBookingStatus(id, bookingStatus);

            response.put("success", true);
            response.put("message", "Booking status updated successfully");
            response.put("booking", updatedBooking);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", "Invalid booking status");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Status update failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Cancel booking
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            Booking cancelledBooking = bookingService.cancelBooking(id);

            response.put("success", true);
            response.put("message", "Booking cancelled successfully");
            response.put("booking", cancelledBooking);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Booking cancellation failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Confirm booking
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<Map<String, Object>> confirmBooking(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            Booking confirmedBooking = bookingService.confirmBooking(id);

            response.put("success", true);
            response.put("message", "Booking confirmed successfully");
            response.put("booking", confirmedBooking);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Booking confirmation failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Check availability
    @GetMapping("/availability")
    public ResponseEntity<Map<String, Object>> checkAvailability(
            @RequestParam Long hotelId,
            @RequestParam String checkIn,
            @RequestParam String checkOut,
            @RequestParam Integer rooms) {
        Map<String, Object> response = new HashMap<>();

        try {
            LocalDate checkInDate = LocalDate.parse(checkIn);
            LocalDate checkOutDate = LocalDate.parse(checkOut);

            boolean available = bookingService.checkAvailability(hotelId, checkInDate, checkOutDate, rooms);

            response.put("available", available);
            response.put("hotelId", hotelId);
            response.put("checkIn", checkIn);
            response.put("checkOut", checkOut);
            response.put("rooms", rooms);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("error", "Availability check failed");
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    // Get booking statistics
    @GetMapping("/stats")
    public ResponseEntity<BookingService.BookingStats> getBookingStats() {
        try {
            BookingService.BookingStats stats = bookingService.getBookingStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete booking
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBooking(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            bookingService.deleteBooking(id);

            response.put("success", true);
            response.put("message", "Booking deleted successfully");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Booking deletion failed. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Update payment status
    @PostMapping("/{id}/payment")
    public ResponseEntity<Map<String, Object>> updatePaymentStatus(@PathVariable Long id,
            @RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        String razorpayPaymentId = payload.get("razorpayPaymentId");

        try {
            Booking booking = bookingService.getBookingById(id);
            if (booking == null) {
                response.put("success", false);
                response.put("message", "Booking not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // booking.setRazorpayPaymentId(razorpayPaymentId);
            // Strict Rule: Payment Success -> Host Confirmation (Booking remains PENDING)
            // booking.setPaymentStatus("SUCCESS");

            // Use service method handles saving and wallet logic (skip wallet for MANUAL)
            bookingService.updatePaymentDetails(id, "SUCCESS", razorpayPaymentId);

            response.put("success", true);
            response.put("message", "Payment updated. Waiting for host confirmation.");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update payment status");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Request DTO for booking creation
    public static class BookingRequest {
        private Long userId;
        private Long hotelId;
        private String guestName;
        private String guestEmail;
        private String guestPhone;
        private LocalDate checkInDate;
        private LocalDate checkOutDate;
        private Integer guests;
        private Integer rooms;
        private String roomType;
        private String specialRequests;
        private String paymentMethod;

        // Getters and Setters
        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public Long getHotelId() {
            return hotelId;
        }

        public void setHotelId(Long hotelId) {
            this.hotelId = hotelId;
        }

        public String getGuestName() {
            return guestName;
        }

        public void setGuestName(String guestName) {
            this.guestName = guestName;
        }

        public String getGuestEmail() {
            return guestEmail;
        }

        public void setGuestEmail(String guestEmail) {
            this.guestEmail = guestEmail;
        }

        public String getGuestPhone() {
            return guestPhone;
        }

        public void setGuestPhone(String guestPhone) {
            this.guestPhone = guestPhone;
        }

        public LocalDate getCheckInDate() {
            return checkInDate;
        }

        public void setCheckInDate(LocalDate checkInDate) {
            this.checkInDate = checkInDate;
        }

        public LocalDate getCheckOutDate() {
            return checkOutDate;
        }

        public void setCheckOutDate(LocalDate checkOutDate) {
            this.checkOutDate = checkOutDate;
        }

        public Integer getGuests() {
            return guests;
        }

        public void setGuests(Integer guests) {
            this.guests = guests;
        }

        public Integer getRooms() {
            return rooms;
        }

        public void setRooms(Integer rooms) {
            this.rooms = rooms;
        }

        public String getRoomType() {
            return roomType;
        }

        public void setRoomType(String roomType) {
            this.roomType = roomType;
        }

        public String getSpecialRequests() {
            return specialRequests;
        }

        public void setSpecialRequests(String specialRequests) {
            this.specialRequests = specialRequests;
        }

        private java.math.BigDecimal pricePerNight;
        private java.math.BigDecimal totalAmount;
        private Integer totalNights;

        public java.math.BigDecimal getPricePerNight() {
            return pricePerNight;
        }

        public void setPricePerNight(java.math.BigDecimal pricePerNight) {
            this.pricePerNight = pricePerNight;
        }

        public java.math.BigDecimal getTotalAmount() {
            return totalAmount;
        }

        public void setTotalAmount(java.math.BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
        }

        public Integer getTotalNights() {
            return totalNights;
        }

        public void setTotalNights(Integer totalNights) {
            this.totalNights = totalNights;
        }

        public String getPaymentMethod() {
            return paymentMethod;
        }

        public void setPaymentMethod(String paymentMethod) {
            this.paymentMethod = paymentMethod;
        }

        private String paymentStatus;
        private String razorpayPaymentId;

        public String getPaymentStatus() {
            return paymentStatus;
        }

        public void setPaymentStatus(String paymentStatus) {
            this.paymentStatus = paymentStatus;
        }

        public String getRazorpayPaymentId() {
            return razorpayPaymentId;
        }

        public void setRazorpayPaymentId(String razorpayPaymentId) {
            this.razorpayPaymentId = razorpayPaymentId;
        }
    }
}