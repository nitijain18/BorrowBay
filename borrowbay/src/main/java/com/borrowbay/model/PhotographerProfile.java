package com.borrowbay.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
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
@Table(name = "photographer_profiles")
public class PhotographerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private User user;                     // the photographer's login account

    private String bio;
    private String specializations;        // "Wedding, Portrait, Product"
    private String city;

    private String instagramUrl;           // used for portfolio verification
    private Boolean isVerified = false;    // admin verifies via Instagram

    @ElementCollection
    private List<String> portfolioImages = new ArrayList<>();  // uploaded sample work

    private Double pricePerHour;
    private Double pricePerDay;

    private Double averageRating = 0.0;
    private Integer totalBookings = 0;

    private Boolean isAvailable = true;    // toggle off when on leave
}