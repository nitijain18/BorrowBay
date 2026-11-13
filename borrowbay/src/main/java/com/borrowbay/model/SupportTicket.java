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
@Table(name = "support_tickets")
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String subject;
    private String description;

    private String status = "OPEN";   // "OPEN", "IN_PROGRESS", "RESOLVED"
    private String resolution;

    @ManyToOne
    private User raisedBy;

    @ManyToOne
    private Order order;              // which order this issue relates to

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime resolvedAt;
}