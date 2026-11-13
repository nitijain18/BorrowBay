package com.borrowbay.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.SellerProfile;

public interface SellerProfileRepository extends JpaRepository<SellerProfile, Long> {
    Optional<SellerProfile> findByUserId(Long userId);
    List<SellerProfile> findByAccountStatus(String accountStatus);
    Boolean existsByUserId(Long userId);
}