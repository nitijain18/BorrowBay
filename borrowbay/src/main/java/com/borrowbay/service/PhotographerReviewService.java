package com.borrowbay.service;

import java.util.List;
import com.borrowbay.model.PhotographerReview;

public interface PhotographerReviewService {
    PhotographerReview createReview(PhotographerReview req);
    PhotographerReview findById(Long id);
    List<PhotographerReview> findByPhotographerId(Long photographerId);
    void deleteReview(Long id);
}