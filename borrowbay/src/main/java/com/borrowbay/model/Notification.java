package com.borrowbay.model;

import java.time.LocalDateTime;

import com.borrowbay.domain.NotificationType;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;
    private Boolean isRead = false;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    @ManyToOne
    private User user;

    private LocalDateTime createdAt = LocalDateTime.now();
    // Auto-set createdAt before saving
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}