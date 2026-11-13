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
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String transactionId;      // gateway ref id
    private String gateway;            // "Razorpay", "Stripe"
    private Double amount;
    private String type;               // "PAYMENT", "REFUND", "COMMISSION"

    @ManyToOne
    private Payment payment;

    @ManyToOne
    private User user;

    private LocalDateTime timestamp = LocalDateTime.now();
}