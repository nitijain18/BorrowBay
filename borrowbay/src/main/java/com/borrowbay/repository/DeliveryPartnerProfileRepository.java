package com.borrowbay.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.DeliveryPartnerProfile;

public interface DeliveryPartnerProfileRepository extends JpaRepository<DeliveryPartnerProfile, Long> {
    Optional<DeliveryPartnerProfile> findByUserId(Long userId);
    List<DeliveryPartnerProfile> findByIsAvailableTrue();
    List<DeliveryPartnerProfile> findByIsVerifiedTrue();
    List<DeliveryPartnerProfile> findByCityIgnoreCase(String city);
    List<DeliveryPartnerProfile> findByIsAvailableTrueAndCityIgnoreCase(String city);
    
    List<DeliveryPartnerProfile> findByIsAvailableTrueAndIsVerifiedTrueAndCityIgnoreCase(String city);
}