package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.model.BookingSlot;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.BookingSlotService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/booking-slots")
@RequiredArgsConstructor
public class BookingSlotController {

    private final BookingSlotService bookingSlotService;

    @PostMapping
    public ResponseEntity<BookingSlot> createBooking(@RequestBody BookingSlot req) {
        return ResponseEntity.ok(bookingSlotService.createBooking(req));
    }

    @GetMapping
    public ResponseEntity<List<BookingSlot>> getAllBookings() {
        return ResponseEntity.ok(bookingSlotService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingSlot> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingSlotService.findById(id));
    }

    @GetMapping("/photographer/{photographerId}")
    public ResponseEntity<List<BookingSlot>> getByPhotographer(@PathVariable Long photographerId) {
        return ResponseEntity.ok(bookingSlotService.findByPhotographerId(photographerId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BookingSlot>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(bookingSlotService.findByCustomerId(customerId));
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<BookingSlot> confirmBooking(@PathVariable Long id) {
        return ResponseEntity.ok(bookingSlotService.confirmBooking(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteBooking(@PathVariable Long id) {
        bookingSlotService.deleteBooking(id);
        return ResponseEntity.ok(new ApiResponse("Booking deleted successfully", true));
    }
}