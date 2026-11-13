package com.borrowbay.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import com.borrowbay.model.OtpVerification;

public interface OtpVerificationRepository
        extends JpaRepository<OtpVerification, Long> {

    List<OtpVerification> findByEmail(String email);

    @Transactional
    @Modifying
    @Query("DELETE FROM OtpVerification o WHERE o.email = :email")
    void deleteByEmail(String email);
}