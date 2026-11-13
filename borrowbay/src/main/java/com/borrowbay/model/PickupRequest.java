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
@Table(name = "pickup_requests")
public class PickupRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    private Order order;

    @ManyToOne
    private User deliveryPartner;

    @ManyToOne
    private Address pickupAddress;   // customer's address (return journey)

    @ManyToOne
    private Address dropAddress;     // seller's address

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status = DeliveryStatus.ASSIGNED;

    private String conditionVideoUrl;    // condition check video on return
    private Boolean damageFound = false;
    private String damageNotes;

    private LocalDateTime assignedAt = LocalDateTime.now();
    private LocalDateTime returnedAt;
}