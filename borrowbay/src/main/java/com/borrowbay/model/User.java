package com.borrowbay.model;

import java.time.LocalDateTime;

import com.borrowbay.domain.USER_ROLE;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;

    @NotBlank
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    private String profileImage;
    private String phoneNumber;

    @Column(name = "is_admin")
private Boolean isAdmin = false;

    @Enumerated(EnumType.STRING)
    private USER_ROLE role = USER_ROLE.ROLE_CUSTOMER;

    private LocalDateTime createdAt = LocalDateTime.now();
}