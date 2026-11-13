package com.borrowbay.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.PhotographerProfile;

public interface PhotographerProfileRepository
        extends JpaRepository<PhotographerProfile, Long> {

    // Only verified + available (for browse page)
    List<PhotographerProfile> findByIsAvailableTrueAndIsVerifiedTrue();

    // Only verified + available in a city
    List<PhotographerProfile> findByCityIgnoreCaseAndIsAvailableTrueAndIsVerifiedTrue(
            String city);

    // Find by user id (for apply page check)
    Optional<PhotographerProfile> findByUserId(Long userId);

    // All unverified (for admin)
    List<PhotographerProfile> findByIsVerifiedFalse();
}