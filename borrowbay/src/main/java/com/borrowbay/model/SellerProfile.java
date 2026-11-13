package com.borrowbay.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
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
@Table(name = "seller_profiles")
public class SellerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private User user;                    // the seller's login account

    private String businessName;
    private String gstin;                 // GST number (optional)
    private String bankAccountNumber;
    private String ifscCode;
    private String accountHolderName;
    @ManyToOne
private Address pickupAddress;

    private String accountStatus = "PENDING";  // "PENDING", "APPROVED", "REJECTED"
    private String rejectionReason;            // filled by admin if rejected

    private Double totalEarnings = 0.0;
    private Double pendingEarnings = 0.0;      // earned but not yet paid out

    private Boolean isEmailVerified = false;

    private String profileDescription;
    private String city;
}