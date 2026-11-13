package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.model.Review;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.ReviewService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review req) {
        return ResponseEntity.ok(reviewService.createReview(req));
    }

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(reviewService.findById(id));
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<Review>> getReviewsByItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(reviewService.findByItemId(itemId));
    }

    @GetMapping("/reviewer/{reviewerId}")
    public ResponseEntity<List<Review>> getReviewsByReviewer(@PathVariable Long reviewerId) {
        return ResponseEntity.ok(reviewService.findByReviewerId(reviewerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(new ApiResponse("Review deleted successfully", true));
    }
}