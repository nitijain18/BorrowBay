package com.borrowbay.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.borrowbay.model.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByItemId(Long itemId);

    List<Review> findByReviewerId(Long reviewerId);

    boolean existsByItemIdAndReviewerId(Long itemId, Long reviewerId);
}