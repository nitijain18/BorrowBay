package com.borrowbay.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.service.BookingSlotService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingSlotServiceImpl implements BookingSlotService {

    private final BookingSlotRepository bookingSlotRepository;
    private final UserRepository userRepository;
    private final PhotographerProfileRepository photographerProfileRepository; // ← add this

    @Override
    public BookingSlot createBooking(BookingSlot req) {

        // Load PhotographerProfile (NOT User)
        PhotographerProfile photographer = photographerProfileRepository
                .findById(req.getPhotographer().getId())
                .orElseThrow(() -> new BorrowBayException("Photographer not found"));

        // Load customer User
        User customer = userRepository
                .findById(req.getCustomer().getId())
                .orElseThrow(() -> new BorrowBayException("Customer not found"));

        // Check for time conflicts
        List<BookingSlot> existing = bookingSlotRepository
                .findByPhotographerIdAndBookingDate(
                        photographer.getId(), req.getBookingDate());

        for (BookingSlot slot : existing) {
            if (slot.getIsConfirmed() &&
                !(req.getEndTime().isBefore(slot.getStartTime()) ||
                  req.getStartTime().isAfter(slot.getEndTime()))) {
                throw new BorrowBayException(
                        "Photographer is already booked at this time");
            }
        }

        // Calculate price from hours
        double price = 0;
        if (req.getStartTime() != null && req.getEndTime() != null) {
            long minutes = java.time.Duration.between(
                    req.getStartTime(), req.getEndTime()).toMinutes();
            double hours = minutes / 60.0;
            price = hours * photographer.getPricePerHour();
        }

        BookingSlot booking = new BookingSlot();
        booking.setPhotographer(photographer); // ← PhotographerProfile ✅
        booking.setCustomer(customer);
        booking.setBookingDate(req.getBookingDate());
        booking.setStartTime(req.getStartTime());
        booking.setEndTime(req.getEndTime());
        booking.setPrice(price > 0 ? price : req.getPrice());
        booking.setLocation(req.getLocation());
        booking.setEventDescription(req.getEventDescription());
        booking.setIsConfirmed(false);

        return bookingSlotRepository.save(booking);
    }

    @Override
    public BookingSlot findById(Long id) {
        return bookingSlotRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException(
                        "Booking not found with id " + id));
    }

    @Override
    public List<BookingSlot> findAll() {
        return bookingSlotRepository.findAll();
    }

    @Override
    public List<BookingSlot> findByPhotographerId(Long photographerId) {
        return bookingSlotRepository.findByPhotographerId(photographerId);
    }

    @Override
    public List<BookingSlot> findByCustomerId(Long customerId) {
        return bookingSlotRepository.findByCustomerId(customerId);
    }

    @Override
    public BookingSlot confirmBooking(Long id) {
        BookingSlot booking = findById(id);
        booking.setIsConfirmed(true);
        return bookingSlotRepository.save(booking);
    }

    @Override
    public void deleteBooking(Long id) {
        bookingSlotRepository.delete(findById(id));
    }
}