package com.borrowbay.model;

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
@Table(name = "delivery_partner_profiles")
public class DeliveryPartnerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private User user;                       // the delivery partner's login account

    private String vehicleType;              // "BIKE", "SCOOTER", "VAN"
    private String vehicleNumber;            // "MH12AB1234"

    private Boolean isAvailable = true;      // free to accept new deliveries?
    private Boolean isVerified = false;      // admin verified documents

    private String licenseNumber;
    private String city;

    private Integer totalDeliveriesCompleted = 0;
    private Double totalEarnings = 0.0;

    private Double currentLatitude;          // live location — updated from app
    private Double currentLongitude;
}