package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.model.DeliveryPartnerProfile;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.DeliveryPartnerProfileService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/delivery-partner-profiles")
@RequiredArgsConstructor
public class DeliveryPartnerProfileController {

    private final DeliveryPartnerProfileService deliveryPartnerProfileService;

    @PostMapping
    public ResponseEntity<DeliveryPartnerProfile> createProfile(@RequestBody DeliveryPartnerProfile req) {
        return ResponseEntity.ok(deliveryPartnerProfileService.createProfile(req));
    }

    @GetMapping
    public ResponseEntity<List<DeliveryPartnerProfile>> getAllPartners() {
        return ResponseEntity.ok(deliveryPartnerProfileService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryPartnerProfile> getProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryPartnerProfileService.findById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<DeliveryPartnerProfile> getProfileByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(deliveryPartnerProfileService.findByUserId(userId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<DeliveryPartnerProfile>> getAvailable() {
        return ResponseEntity.ok(deliveryPartnerProfileService.findAvailable());
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<DeliveryPartnerProfile>> getByCity(@PathVariable String city) {
        return ResponseEntity.ok(deliveryPartnerProfileService.findByCity(city));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<DeliveryPartnerProfile> verifyPartner(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryPartnerProfileService.verifyPartner(id));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<DeliveryPartnerProfile> toggleAvailability(@PathVariable Long id,
                                                                      @RequestParam Boolean isAvailable) {
        return ResponseEntity.ok(deliveryPartnerProfileService.toggleAvailability(id, isAvailable));
    }

    @PatchMapping("/{id}/location")
    public ResponseEntity<DeliveryPartnerProfile> updateLocation(@PathVariable Long id,
                                                                  @RequestParam Double latitude,
                                                                  @RequestParam Double longitude) {
        return ResponseEntity.ok(deliveryPartnerProfileService.updateLocation(id, latitude, longitude));
    }

    @PutMapping("/{id}")
public ResponseEntity<DeliveryPartnerProfile> update(
        @PathVariable Long id,
        @RequestBody DeliveryPartnerProfile req) {
    return ResponseEntity.ok(
        deliveryPartnerProfileService.updateProfile(id, req));
}
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteProfile(@PathVariable Long id) {
        deliveryPartnerProfileService.deleteProfile(id);
        return ResponseEntity.ok(new ApiResponse("Profile deleted successfully", true));
    }
}