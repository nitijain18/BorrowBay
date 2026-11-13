package com.borrowbay.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.Address;
import com.borrowbay.model.User;
import com.borrowbay.repository.AddressRepository;
import com.borrowbay.repository.UserRepository;
import com.borrowbay.service.AddressService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    @Override
    public Address addAddress(Address req) {
        if (req.getUser() == null || req.getUser().getId() == null) {
            throw new BorrowBayException("User id is required");
        }
        User user = userRepository.findById(req.getUser().getId())
                .orElseThrow(() -> new BorrowBayException("User not found"));
        req.setUser(user);
        return addressRepository.save(req);
    }

    @Override
    public Address findById(Long id) {
        return addressRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Address not found with id " + id));
    }

    @Override
    public List<Address> findByUserId(Long userId) {
        return addressRepository.findByUserId(userId);
    }

    @Override
    public Address updateAddress(Long id, Address req) {
        Address address = findById(id);
        address.setStreet(req.getStreet());
        address.setCity(req.getCity());
        address.setState(req.getState());
        address.setPincode(req.getPincode());
        address.setLandmark(req.getLandmark());
        address.setLatitude(req.getLatitude());
        address.setLongitude(req.getLongitude());
        return addressRepository.save(address);
    }

    @Override
    public void deleteAddress(Long id) {
        Address address = findById(id);
        addressRepository.delete(address);
    }
}