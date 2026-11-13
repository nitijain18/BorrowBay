package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.model.SellerProfile;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.SellerProfileService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/seller-profiles")
@RequiredArgsConstructor
public class SellerProfileController {

    private final SellerProfileService sellerProfileService;

    @PostMapping
    public ResponseEntity<SellerProfile> createProfile(@RequestBody SellerProfile req) {
        return ResponseEntity.ok(sellerProfileService.createProfile(req));
    }

    @GetMapping
    public ResponseEntity<List<SellerProfile>> getAllProfiles() {
        return ResponseEntity.ok(sellerProfileService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SellerProfile> getProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(sellerProfileService.findById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<SellerProfile> getProfileByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(sellerProfileService.findByUserId(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<SellerProfile>> getPendingSellers() {
        return ResponseEntity.ok(sellerProfileService.findPending());
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<SellerProfile> approveProfile(@PathVariable Long id) {
        return ResponseEntity.ok(sellerProfileService.approveProfile(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<SellerProfile> rejectProfile(@PathVariable Long id,
                                                        @RequestParam String reason) {
        return ResponseEntity.ok(sellerProfileService.rejectProfile(id, reason));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SellerProfile> updateProfile(@PathVariable Long id,
                                                        @RequestBody SellerProfile req) {
        return ResponseEntity.ok(sellerProfileService.updateProfile(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteProfile(@PathVariable Long id) {
        sellerProfileService.deleteProfile(id);
        return ResponseEntity.ok(new ApiResponse("Profile deleted successfully", true));
    }
}