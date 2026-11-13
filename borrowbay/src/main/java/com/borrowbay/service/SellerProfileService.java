package com.borrowbay.service;

import java.util.List;
import com.borrowbay.model.SellerProfile;

public interface SellerProfileService {
    SellerProfile createProfile(SellerProfile req);
    SellerProfile findById(Long id);
    SellerProfile findByUserId(Long userId);
    List<SellerProfile> findAll();
    List<SellerProfile> findPending();
    SellerProfile approveProfile(Long id);
    SellerProfile rejectProfile(Long id, String reason);
    SellerProfile updateProfile(Long id, SellerProfile req);
    void deleteProfile(Long id);
}