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
@Table(name = "coupon_usages")
public class CouponUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Coupon coupon;              // which coupon was used

    @ManyToOne
    private User user;                  // who used it

    @ManyToOne
    private Order order;                // on which order

    private Double discountApplied;     // actual rupee amount discounted

    private LocalDateTime usedAt = LocalDateTime.now();
}