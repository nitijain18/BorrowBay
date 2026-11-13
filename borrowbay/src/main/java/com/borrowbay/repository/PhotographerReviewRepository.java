package com.borrowbay.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.PhotographerReview;

public interface PhotographerReviewRepository extends JpaRepository<PhotographerReview, Long> {
    List<PhotographerReview> findByPhotographerId(Long photographerId);
    List<PhotographerReview> findByReviewerId(Long reviewerId);
    Boolean existsByBookingSlotIdAndReviewerId(Long bookingSlotId, Long reviewerId);
}