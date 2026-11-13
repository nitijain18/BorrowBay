package com.borrowbay.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.borrowbay.domain.ItemCondition;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @ElementCollection
    private List<String> images = new ArrayList<>();

    private Double rentPricePerDay;
    private Double securityDeposit;

    @Enumerated(EnumType.STRING)
    private ItemCondition condition;

    private Boolean isAvailable = true;

    private Double averageRating = 0.0;
    private Integer totalReviews = 0;

    @ManyToOne
    private User seller;

    @ManyToOne
    private SubCategory subCategory;

    private LocalDateTime createdAt = LocalDateTime.now();
}