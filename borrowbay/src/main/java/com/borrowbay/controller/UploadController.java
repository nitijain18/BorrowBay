package com.borrowbay.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.CloudinaryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;
    private final PhotographerProfileRepository photographerProfileRepository;

    // ── Upload item images ──
    // POST /upload/item/{itemId}/images
    // Accepts multiple files at once
    @PostMapping("/item/{itemId}/images")
    public ResponseEntity<Item> uploadItemImages(
            @PathVariable Long itemId,
            @RequestParam("files") List<MultipartFile> files) {
        // @RequestParam("files") = reads files from form-data field named "files"

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new BorrowBayException("Item not found"));

        List<String> uploadedUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                // Upload each image to Cloudinary under "borrowbay/items" folder
                String url = cloudinaryService.uploadImage(file, "borrowbay/items");
                uploadedUrls.add(url);
            }
        }

        // Add new URLs to existing images list
        item.getImages().addAll(uploadedUrls);
        return ResponseEntity.ok(itemRepository.save(item));
    }

    // ── Upload user profile photo ──
    // POST /upload/user/{userId}/profile
    @PostMapping("/user/{userId}/profile")
    public ResponseEntity<User> uploadProfilePhoto(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BorrowBayException("User not found"));

        String url = cloudinaryService.uploadImage(file, "borrowbay/profiles");
        user.setProfileImage(url);
        return ResponseEntity.ok(userRepository.save(user));
    }

    // ── Upload photographer portfolio images ──
    // POST /upload/photographer/{profileId}/portfolio
    @PostMapping("/photographer/{profileId}/portfolio")
    public ResponseEntity<PhotographerProfile> uploadPortfolio(
            @PathVariable Long profileId,
            @RequestParam("files") List<MultipartFile> files) {

        PhotographerProfile profile = photographerProfileRepository
                .findById(profileId)
                .orElseThrow(() -> new BorrowBayException("Profile not found"));

        List<String> uploadedUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String url = cloudinaryService.uploadImage(
                        file, "borrowbay/portfolios");
                uploadedUrls.add(url);
            }
        }

        profile.getPortfolioImages().addAll(uploadedUrls);
        return ResponseEntity.ok(photographerProfileRepository.save(profile));
    }

    // ── Delete an image ──
    // DELETE /upload/image?url=https://res.cloudinary.com/...
    @DeleteMapping("/image")
    public ResponseEntity<ApiResponse> deleteImage(@RequestParam String url) {
        cloudinaryService.deleteImage(url);
        return ResponseEntity.ok(new ApiResponse("Image deleted", true));
    }
}