package com.borrowbay.model;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String reviewText;
    private Double rating;            // 1.0 to 5.0

    @ElementCollection
    private List<String> reviewImages;

    @JsonIgnoreProperties({"cartItems", "images", "reviews",
                        "availabilityBlocks", "seller",
                        "subCategory"})
    @ManyToOne
    private Item item;

    @ManyToOne
    private User reviewer;            // the customer who rented

    private LocalDateTime createdAt = LocalDateTime.now();

@PrePersist
public void prePersist() {
    this.createdAt = LocalDateTime.now();
}
}