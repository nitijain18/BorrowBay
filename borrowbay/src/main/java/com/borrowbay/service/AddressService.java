package com.borrowbay.service;

import java.util.List;
import com.borrowbay.model.Address;

public interface AddressService {
    Address addAddress(Address req);
    Address findById(Long id);
    List<Address> findByUserId(Long userId);
    Address updateAddress(Long id, Address req);
    void deleteAddress(Long id);
}