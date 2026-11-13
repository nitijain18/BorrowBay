package com.borrowbay.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.domain.USER_ROLE;
import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.service.SellerProfileService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SellerProfileServiceImpl implements SellerProfileService {

    private final SellerProfileRepository sellerProfileRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
@Override
public SellerProfile createProfile(SellerProfile req) {
    User user = userRepository.findById(req.getUser().getId())
            .orElseThrow(() -> new BorrowBayException("User not found"));

    user.setRole(USER_ROLE.ROLE_SELLER);
    userRepository.save(user);

    SellerProfile profile = new SellerProfile();
    profile.setUser(user);
    profile.setBusinessName(req.getBusinessName());
    profile.setGstin(req.getGstin());
    profile.setBankAccountNumber(req.getBankAccountNumber());
    profile.setIfscCode(req.getIfscCode());
    profile.setAccountHolderName(req.getAccountHolderName());
    profile.setCity(req.getCity());
    profile.setProfileDescription(req.getProfileDescription());

    // Set pickup address
    if (req.getPickupAddress() != null && req.getPickupAddress().getId() != null) {
        Address address = addressRepository.findById(req.getPickupAddress().getId())
                .orElseThrow(() -> new BorrowBayException("Address not found"));
        profile.setPickupAddress(address);
    }

    profile.setAccountStatus("PENDING");
    profile.setTotalEarnings(0.0);
    profile.setPendingEarnings(0.0);

    return sellerProfileRepository.save(profile);
}

    @Override
    public SellerProfile findById(Long id) {
        return sellerProfileRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Seller profile not found with id " + id));
    }

    @Override
    public SellerProfile findByUserId(Long userId) {
        return sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BorrowBayException("Seller profile not found for user " + userId));
    }

    @Override
    public List<SellerProfile> findAll() {
        return sellerProfileRepository.findAll();
    }

    @Override
    public List<SellerProfile> findPending() {
        return sellerProfileRepository.findByAccountStatus("PENDING");
    }

    @Override
    public SellerProfile approveProfile(Long id) {
        SellerProfile profile = findById(id);
        profile.setAccountStatus("APPROVED");
        return sellerProfileRepository.save(profile);
    }

    @Override
    public SellerProfile rejectProfile(Long id, String reason) {
        SellerProfile profile = findById(id);
        profile.setAccountStatus("REJECTED");
        profile.setRejectionReason(reason);
        return sellerProfileRepository.save(profile);
    }

    @Override
    public SellerProfile updateProfile(Long id, SellerProfile req) {
        SellerProfile profile = findById(id);
        profile.setBusinessName(req.getBusinessName());
        profile.setGstin(req.getGstin());
        profile.setBankAccountNumber(req.getBankAccountNumber());
        profile.setIfscCode(req.getIfscCode());
        profile.setAccountHolderName(req.getAccountHolderName());
        profile.setProfileDescription(req.getProfileDescription());
        profile.setCity(req.getCity());
        return sellerProfileRepository.save(profile);
    }

    @Override
    public void deleteProfile(Long id) {
        sellerProfileRepository.delete(findById(id));
    }
}