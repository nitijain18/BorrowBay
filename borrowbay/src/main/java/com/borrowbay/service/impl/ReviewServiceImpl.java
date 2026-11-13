package com.borrowbay.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.domain.OrderStatus;
import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.service.ReviewService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    public Review createReview(Review req) {
        if (req.getItem() == null || req.getItem().getId() == null)
            throw new BorrowBayException("Item id is required");
        if (req.getReviewer() == null || req.getReviewer().getId() == null)
            throw new BorrowBayException("Reviewer id is required");

        Item item = itemRepository.findById(req.getItem().getId())
                .orElseThrow(() -> new BorrowBayException("Item not found"));
        User reviewer = userRepository.findById(req.getReviewer().getId())
                .orElseThrow(() -> new BorrowBayException("User not found"));

        // Check if user has any non-cancelled order containing this item
        boolean hasOrdered = orderItemRepository
                .existsByItemIdAndOrderCustomerIdAndOrderStatusNot(
                        item.getId(), reviewer.getId(), OrderStatus.CANCELLED);

        if (!hasOrdered)
            throw new BorrowBayException(
                "You can only review items you have rented");

        if (reviewRepository.existsByItemIdAndReviewerId(
                item.getId(), reviewer.getId()))
            throw new BorrowBayException(
                "You have already reviewed this item");

        Review review = new Review();
        review.setReviewText(req.getReviewText());
        review.setRating(req.getRating());
        review.setReviewImages(req.getReviewImages());
        review.setItem(item);
        review.setReviewer(reviewer);
        review.setCreatedAt(LocalDateTime.now());
        Review savedReview = reviewRepository.save(review);

        List<Review> allReviews = reviewRepository.findByItemId(item.getId());
        double avg = allReviews.stream()
                .mapToDouble(Review::getRating).average().orElse(0.0);
        item.setAverageRating(avg);
        item.setTotalReviews(allReviews.size());
        itemRepository.save(item);

        return savedReview;
    }

    @Override
    public Review findById(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() ->
                    new BorrowBayException("Review not found with id " + id));
    }

    @Override
    public List<Review> findAll() {
        return reviewRepository.findAll();
    }

    @Override
    public List<Review> findByItemId(Long itemId) {
        return reviewRepository.findByItemId(itemId);
    }

    @Override
    public List<Review> findByReviewerId(Long reviewerId) {
        return reviewRepository.findByReviewerId(reviewerId);
    }

    @Override
    public void deleteReview(Long id) {
        reviewRepository.delete(findById(id));
    }
}