package com.borrowbay.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.BookingSlot;

public interface BookingSlotRepository extends JpaRepository<BookingSlot, Long> {
    List<BookingSlot> findByPhotographerId(Long photographerId);
    List<BookingSlot> findByCustomerId(Long customerId);
    List<BookingSlot> findByPhotographerIdAndBookingDate(Long photographerId, LocalDate date);
    List<BookingSlot> findByIsConfirmedTrue();
}