package com.borrowbay.service;

import java.util.List;
import com.borrowbay.model.PhotographerProfile;

public interface PhotographerProfileService {
    PhotographerProfile createProfile(PhotographerProfile req);
    PhotographerProfile findById(Long id);
    PhotographerProfile findByUserId(Long userId);
    List<PhotographerProfile> findAll();
    List<PhotographerProfile> findAvailable();
    List<PhotographerProfile> findByCity(String city);
    PhotographerProfile verifyPhotographer(Long id);
    PhotographerProfile toggleAvailability(Long id, Boolean isAvailable);
    PhotographerProfile updateProfile(Long id, PhotographerProfile req);
    void deleteProfile(Long id);
}