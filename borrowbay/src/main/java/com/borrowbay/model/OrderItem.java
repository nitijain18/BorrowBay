package com.borrowbay.model;

import java.time.LocalDate;

import com.borrowbay.domain.OrderStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;

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
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Item item;

    @JsonIgnore
    @ManyToOne
    private Order order;

    private LocalDate rentalStartDate;
    private LocalDate rentalEndDate;
    private Integer rentalDays;

    private Double rentAmount;
    private Double depositAmount;

    @Enumerated(EnumType.STRING)
    private OrderStatus status = OrderStatus.PENDING;
}