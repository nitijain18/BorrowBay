package com.borrowbay.service;

import java.util.List;
import com.borrowbay.model.DeliveryPartnerProfile;

public interface DeliveryPartnerProfileService {
    DeliveryPartnerProfile createProfile(DeliveryPartnerProfile req);
    DeliveryPartnerProfile findById(Long id);
    DeliveryPartnerProfile findByUserId(Long userId);
    List<DeliveryPartnerProfile> findAll();
    List<DeliveryPartnerProfile> findAvailable();
    List<DeliveryPartnerProfile> findByCity(String city);
    DeliveryPartnerProfile verifyPartner(Long id);
    DeliveryPartnerProfile toggleAvailability(Long id, Boolean isAvailable);
    DeliveryPartnerProfile updateLocation(Long id, Double lat, Double lng);
    void deleteProfile(Long id);
    DeliveryPartnerProfile updateProfile(Long id, DeliveryPartnerProfile req);
}