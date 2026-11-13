package com.borrowbay.service;

import java.util.List;
import com.borrowbay.model.Review;

public interface ReviewService {
    Review createReview(Review req);
    Review findById(Long id);
    List<Review> findAll();
    List<Review> findByItemId(Long itemId);
    List<Review> findByReviewerId(Long reviewerId);
    void deleteReview(Long id);
}