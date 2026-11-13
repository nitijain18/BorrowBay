package com.borrowbay.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.model.Cart;
import com.borrowbay.model.CartItem;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.CartService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getOrCreateCart(userId));
    }

    @PostMapping("/user/{userId}/add-item/{itemId}")
    public ResponseEntity<Cart> addItem(@PathVariable Long userId,
                                        @PathVariable Long itemId,
                                        @RequestBody CartItem req) {
        return ResponseEntity.ok(cartService.addItemToCart(userId, itemId, req));
    }

    @DeleteMapping("/user/{userId}/remove-item/{itemId}")
    public ResponseEntity<Cart> removeItem(@PathVariable Long userId,
                                           @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItemFromCart(userId, itemId));
    }

    @DeleteMapping("/user/{userId}/clear")
    public ResponseEntity<ApiResponse> clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(new ApiResponse("Cart cleared successfully", true));
    }
}