package com.staylio.backend.Scheduler;

import com.staylio.backend.Service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class BookingScheduler {

    @Autowired
    private BookingService bookingService;

    // Run every day at midnight (00:00:00)
    // Auto-cancel pending bookings past check-in date
    @Scheduled(cron = "0 0 0 * * ?")
    public void scheduleAutoCancel() {
        System.out.println("Running Auto-Cancel Job at " + LocalDateTime.now());
        try {
            bookingService.autoCancelOverdueBookings();
        } catch (Exception e) {
            System.err.println("Error in Auto-Cancel Job: " + e.getMessage());
        }
    }

    // Run every day at midnight (00:00:00)
    // Auto-complete confirmed bookings past check-out date
    @Scheduled(cron = "0 0 0 * * ?")
    public void scheduleAutoComplete() {
        System.out.println("Running Auto-Complete Job at " + LocalDateTime.now());
        try {
            bookingService.autoCompleteFinishedBookings();
        } catch (Exception e) {
            System.err.println("Error in Auto-Complete Job: " + e.getMessage());
        }
    }
}
