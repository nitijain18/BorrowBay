package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.model.PhotographerReview;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.PhotographerReviewService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/photographer-reviews")
@RequiredArgsConstructor
public class PhotographerReviewController {

    private final PhotographerReviewService photographerReviewService;

    @PostMapping
    public ResponseEntity<PhotographerReview> createReview(@RequestBody PhotographerReview req) {
        return ResponseEntity.ok(photographerReviewService.createReview(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhotographerReview> getReviewById(@PathVariable Long id) {
        return ResponseEntity.ok(photographerReviewService.findById(id));
    }

    @GetMapping("/photographer/{photographerId}")
    public ResponseEntity<List<PhotographerReview>> getByPhotographer(@PathVariable Long photographerId) {
        return ResponseEntity.ok(photographerReviewService.findByPhotographerId(photographerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteReview(@PathVariable Long id) {
        photographerReviewService.deleteReview(id);
        return ResponseEntity.ok(new ApiResponse("Review deleted successfully", true));
    }
}