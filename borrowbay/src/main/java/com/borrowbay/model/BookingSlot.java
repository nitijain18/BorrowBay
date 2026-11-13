package com.borrowbay.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "booking_slots")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private Double price;
    private String location;
    private String eventDescription;
    private Boolean isConfirmed = false;

    @ManyToOne
    private PhotographerProfile photographer;

    @ManyToOne
    private User customer;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}