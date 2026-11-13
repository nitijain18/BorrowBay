package com.borrowbay.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.domain.USER_ROLE;
import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.service.DeliveryPartnerProfileService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryPartnerProfileServiceImpl implements DeliveryPartnerProfileService {

    private final DeliveryPartnerProfileRepository deliveryPartnerProfileRepository;
    private final UserRepository userRepository;

    @Override
    public DeliveryPartnerProfile createProfile(DeliveryPartnerProfile req) {
        User user = userRepository.findById(req.getUser().getId())
                .orElseThrow(() -> new BorrowBayException("User not found"));
        user.setRole(USER_ROLE.ROLE_DELIVERY_PARTNER);
        userRepository.save(user);

        DeliveryPartnerProfile profile = new DeliveryPartnerProfile();
        profile.setUser(user);
        profile.setVehicleType(req.getVehicleType());
        profile.setVehicleNumber(req.getVehicleNumber());
        profile.setLicenseNumber(req.getLicenseNumber());
        profile.setCity(req.getCity());
        profile.setIsAvailable(true);
        profile.setIsVerified(false);
        profile.setTotalDeliveriesCompleted(0);
        profile.setTotalEarnings(0.0);
        return deliveryPartnerProfileRepository.save(profile);
    }

    @Override
public DeliveryPartnerProfile updateProfile(
        Long id, DeliveryPartnerProfile req) {
    DeliveryPartnerProfile profile = findById(id);
    profile.setCity(req.getCity());
    profile.setVehicleType(req.getVehicleType());
    profile.setVehicleNumber(req.getVehicleNumber());
    return deliveryPartnerProfileRepository.save(profile);
}

    @Override
    public DeliveryPartnerProfile findById(Long id) {
        return deliveryPartnerProfileRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Profile not found with id " + id));
    }

    @Override
    public DeliveryPartnerProfile findByUserId(Long userId) {
        return deliveryPartnerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BorrowBayException("Profile not found for user " + userId));
    }

    @Override
    public List<DeliveryPartnerProfile> findAll() {
        return deliveryPartnerProfileRepository.findAll();
    }

    @Override
    public List<DeliveryPartnerProfile> findAvailable() {
        return deliveryPartnerProfileRepository.findByIsAvailableTrue();
    }

    @Override
    public List<DeliveryPartnerProfile> findByCity(String city) {
        return deliveryPartnerProfileRepository.findByIsAvailableTrueAndCityIgnoreCase(city);
    }

    @Override
    public DeliveryPartnerProfile verifyPartner(Long id) {
        DeliveryPartnerProfile profile = findById(id);
        profile.setIsVerified(true);
        return deliveryPartnerProfileRepository.save(profile);
    }

    @Override
    public DeliveryPartnerProfile toggleAvailability(Long id, Boolean isAvailable) {
        DeliveryPartnerProfile profile = findById(id);
        profile.setIsAvailable(isAvailable);
        return deliveryPartnerProfileRepository.save(profile);
    }

    @Override
    public DeliveryPartnerProfile updateLocation(Long id, Double lat, Double lng) {
        DeliveryPartnerProfile profile = findById(id);
        profile.setCurrentLatitude(lat);
        profile.setCurrentLongitude(lng);
        return deliveryPartnerProfileRepository.save(profile);
    }

    @Override
    public void deleteProfile(Long id) {
        deliveryPartnerProfileRepository.delete(findById(id));
    }
}