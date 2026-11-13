package com.borrowbay.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.service.PhotographerReviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PhotographerReviewServiceImpl implements PhotographerReviewService {

    private final PhotographerReviewRepository photographerReviewRepository;
    private final UserRepository userRepository;
    private final BookingSlotRepository bookingSlotRepository;

    @Override
    public PhotographerReview createReview(PhotographerReview req) {
        User photographer = userRepository.findById(req.getPhotographer().getId())
                .orElseThrow(() -> new BorrowBayException("Photographer not found"));
        User reviewer = userRepository.findById(req.getReviewer().getId())
                .orElseThrow(() -> new BorrowBayException("Reviewer not found"));
        BookingSlot slot = bookingSlotRepository.findById(req.getBookingSlot().getId())
                .orElseThrow(() -> new BorrowBayException("Booking slot not found"));

        if (photographerReviewRepository.existsByBookingSlotIdAndReviewerId(
                slot.getId(), reviewer.getId()))
            throw new BorrowBayException("You have already reviewed this session");

        PhotographerReview review = new PhotographerReview();
        review.setReviewText(req.getReviewText());
        review.setRating(req.getRating());
        review.setPhotographer(photographer);
        review.setReviewer(reviewer);
        review.setBookingSlot(slot);
        review.setCreatedAt(LocalDateTime.now());
        return photographerReviewRepository.save(review);
    }

    @Override
    public PhotographerReview findById(Long id) {
        return photographerReviewRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Review not found with id " + id));
    }

    @Override
    public List<PhotographerReview> findByPhotographerId(Long photographerId) {
        return photographerReviewRepository.findByPhotographerId(photographerId);
    }

    @Override
    public void deleteReview(Long id) {
        photographerReviewRepository.delete(findById(id));
    }
}