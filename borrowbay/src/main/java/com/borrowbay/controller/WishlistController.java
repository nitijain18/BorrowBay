package com.borrowbay.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.model.Wishlist;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.WishlistService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<Wishlist> getWishlist(@PathVariable Long userId) {
        return ResponseEntity.ok(wishlistService.getOrCreateWishlist(userId));
    }

    @PutMapping("/user/{userId}/add-item/{itemId}")
    public ResponseEntity<Wishlist> addItem(@PathVariable Long userId,
                                             @PathVariable Long itemId) {
        return ResponseEntity.ok(wishlistService.addItem(userId, itemId));
    }

    @PutMapping("/user/{userId}/remove-item/{itemId}")
    public ResponseEntity<Wishlist> removeItem(@PathVariable Long userId,
                                                @PathVariable Long itemId) {
        return ResponseEntity.ok(wishlistService.removeItem(userId, itemId));
    }

    @DeleteMapping("/user/{userId}/clear")
    public ResponseEntity<ApiResponse> clearWishlist(@PathVariable Long userId) {
        wishlistService.clearWishlist(userId);
        return ResponseEntity.ok(new ApiResponse("Wishlist cleared", true));
    }
}