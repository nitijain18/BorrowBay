package com.borrowbay.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.borrowbay.model.PhotographerProfile;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.PhotographerProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/photographer-profiles")
@RequiredArgsConstructor
public class PhotographerProfileController {

    private final PhotographerProfileService photographerProfileService;

    @PostMapping
    public ResponseEntity<PhotographerProfile> create(
            @RequestBody PhotographerProfile req) {
        return ResponseEntity.ok(
            photographerProfileService.createProfile(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhotographerProfile> getById(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            photographerProfileService.findById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<PhotographerProfile> getByUserId(
            @PathVariable Long userId) {
        return ResponseEntity.ok(
            photographerProfileService.findByUserId(userId));
    }

    @GetMapping
    public ResponseEntity<List<PhotographerProfile>> getAll() {
        return ResponseEntity.ok(
            photographerProfileService.findAll());
    }

    @GetMapping("/available")
    public ResponseEntity<List<PhotographerProfile>> getAvailable() {
        return ResponseEntity.ok(
            photographerProfileService.findAvailable());
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<PhotographerProfile>> getByCity(
            @PathVariable String city) {
        return ResponseEntity.ok(
            photographerProfileService.findByCity(city));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<PhotographerProfile> verify(
            @PathVariable Long id) {
        return ResponseEntity.ok(
            photographerProfileService.verifyPhotographer(id));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<PhotographerProfile> toggleAvailability(
            @PathVariable Long id,
            @RequestParam Boolean isAvailable) {
        return ResponseEntity.ok(
            photographerProfileService.toggleAvailability(id, isAvailable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PhotographerProfile> update(
            @PathVariable Long id,
            @RequestBody PhotographerProfile req) {
        return ResponseEntity.ok(
            photographerProfileService.updateProfile(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long id) {
        photographerProfileService.deleteProfile(id);
        return ResponseEntity.ok(
            new ApiResponse("Profile deleted", true));
    }
}