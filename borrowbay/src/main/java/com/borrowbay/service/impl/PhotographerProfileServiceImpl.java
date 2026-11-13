package com.borrowbay.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.domain.USER_ROLE;
import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.service.PhotographerProfileService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PhotographerProfileServiceImpl implements PhotographerProfileService {

    private final PhotographerProfileRepository photographerProfileRepository;
    private final UserRepository userRepository;

    @Override
    public PhotographerProfile createProfile(PhotographerProfile req) {
        User user = userRepository.findById(req.getUser().getId())
                .orElseThrow(() -> new BorrowBayException("User not found"));
        user.setRole(USER_ROLE.ROLE_PHOTOGRAPHER);
        userRepository.save(user);

        PhotographerProfile profile = new PhotographerProfile();
        profile.setUser(user);
        profile.setBio(req.getBio());
        profile.setSpecializations(req.getSpecializations());
        profile.setCity(req.getCity());
        profile.setInstagramUrl(req.getInstagramUrl());
        profile.setPortfolioImages(req.getPortfolioImages());
        profile.setPricePerHour(req.getPricePerHour());
        profile.setPricePerDay(req.getPricePerDay());
        profile.setIsVerified(false);
        profile.setIsAvailable(true);
        profile.setAverageRating(0.0);
        profile.setTotalBookings(0);
        return photographerProfileRepository.save(profile);
    }

    @Override
    public PhotographerProfile findById(Long id) {
        return photographerProfileRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Profile not found with id " + id));
    }

    @Override
    public PhotographerProfile findByUserId(Long userId) {
        return photographerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BorrowBayException("Profile not found for user " + userId));
    }

    @Override
    public List<PhotographerProfile> findAll() {
        return photographerProfileRepository.findAll();
    }

    @Override
    public List<PhotographerProfile> findAvailable() {
        // Only return VERIFIED AND AVAILABLE photographers
        return photographerProfileRepository.findByIsAvailableTrueAndIsVerifiedTrue();
    }

    @Override
    public List<PhotographerProfile> findByCity(String city) {
        // Only return VERIFIED AND AVAILABLE photographers in that city
        return photographerProfileRepository
                .findByCityIgnoreCaseAndIsAvailableTrueAndIsVerifiedTrue(city);
    }

    @Override
    public PhotographerProfile verifyPhotographer(Long id) {
        PhotographerProfile profile = findById(id);
        profile.setIsVerified(true);
        return photographerProfileRepository.save(profile);
    }

    @Override
    public PhotographerProfile toggleAvailability(Long id, Boolean isAvailable) {
        PhotographerProfile profile = findById(id);
        profile.setIsAvailable(isAvailable);
        return photographerProfileRepository.save(profile);
    }

    @Override
    public PhotographerProfile updateProfile(Long id, PhotographerProfile req) {
        PhotographerProfile profile = findById(id);
        profile.setBio(req.getBio());
        profile.setSpecializations(req.getSpecializations());
        profile.setCity(req.getCity());
        profile.setInstagramUrl(req.getInstagramUrl());
        profile.setPortfolioImages(req.getPortfolioImages());
        profile.setPricePerHour(req.getPricePerHour());
        profile.setPricePerDay(req.getPricePerDay());
        return photographerProfileRepository.save(profile);
    }

    @Override
    public void deleteProfile(Long id) {
        photographerProfileRepository.delete(findById(id));
    }
}