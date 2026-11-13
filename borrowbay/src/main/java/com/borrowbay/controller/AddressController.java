package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.model.Address;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.AddressService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    public ResponseEntity<Address> addAddress(@RequestBody Address req) {
        return ResponseEntity.ok(addressService.addAddress(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Address> getAddressById(@PathVariable Long id) {
        return ResponseEntity.ok(addressService.findById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Address>> getAddressesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(addressService.findByUserId(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Address> updateAddress(@PathVariable Long id, @RequestBody Address req) {
        return ResponseEntity.ok(addressService.updateAddress(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok(new ApiResponse("Address deleted successfully", true));
    }
}