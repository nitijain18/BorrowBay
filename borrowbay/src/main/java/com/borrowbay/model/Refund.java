package com.borrowbay.model;

import java.time.LocalDateTime;

import com.borrowbay.domain.RefundStatus;

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
@Table(name = "refunds")
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double refundAmount;
    private String reason;           // "No damage", "Partial damage"

    @Enumerated(EnumType.STRING)
    private RefundStatus status = RefundStatus.PENDING;

    @OneToOne
    private Payment payment;

    @ManyToOne
    private User customer;

    private LocalDateTime initiatedAt = LocalDateTime.now();
    private LocalDateTime resolvedAt;
}