package com.borrowbay.model;

import java.time.LocalDateTime;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "photographer_reviews")
public class PhotographerReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reviewText;
    private Double rating;

    @ManyToOne
    private User photographer;        // who is being reviewed

    @ManyToOne
    private User reviewer;            // customer who booked them

    @ManyToOne
    private BookingSlot bookingSlot;  // which session this review is for

    private LocalDateTime createdAt = LocalDateTime.now();
}