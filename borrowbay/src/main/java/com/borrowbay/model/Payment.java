package com.borrowbay.model;

import java.time.LocalDateTime;

import com.borrowbay.domain.PaymentStatus;

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
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double rentAmount;
    private Double depositAmount;
    private Double totalAmount;       // rent + deposit

    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.PENDING;

    private String paymentGatewayId;  // Razorpay/Stripe transaction ref
    private String paymentMethod;     // "UPI", "CARD", "NETBANKING"

    @OneToOne
    private Order order;

    @ManyToOne
    private User user;

    private LocalDateTime paidAt;
}