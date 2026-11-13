package com.borrowbay.model;

import java.time.LocalDateTime;

import com.borrowbay.domain.DeliveryStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "delivery_requests")
public class DeliveryRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private Order order;

    @ManyToOne
    private User deliveryPartner;     // ROLE_DELIVERY_PARTNER

    @ManyToOne
    private Address pickupAddress;    // seller's address

    @ManyToOne
    private Address dropAddress;      // customer's address

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status = DeliveryStatus.ASSIGNED;

    private String verificationVideoUrl;  // video recorded at pickup

    private LocalDateTime assignedAt = LocalDateTime.now();
    private LocalDateTime deliveredAt;
}