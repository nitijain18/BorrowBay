package com.borrowbay.service;

import java.util.List;
import com.borrowbay.model.BookingSlot;

public interface BookingSlotService {
    BookingSlot createBooking(BookingSlot req);
    BookingSlot findById(Long id);
    List<BookingSlot> findAll();
    List<BookingSlot> findByPhotographerId(Long photographerId);
    List<BookingSlot> findByCustomerId(Long customerId);
    BookingSlot confirmBooking(Long id);
    void deleteBooking(Long id);
}