package com.borrowbay.model;

import java.time.LocalDate;
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
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Table(name = "rental_history")
public class RentalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User customer;

    @ManyToOne
    private Item item;

    @ManyToOne
    private Order order;

    private LocalDate rentedFrom;
    private LocalDate rentedTill;

    private Double totalPaid;

    private LocalDateTime createdAt = LocalDateTime.now();
}