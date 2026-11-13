package com.borrowbay.service;

import com.borrowbay.model.Wishlist;

public interface WishlistService {
    Wishlist getOrCreateWishlist(Long userId);
    Wishlist addItem(Long userId, Long itemId);
    Wishlist removeItem(Long userId, Long itemId);
    void clearWishlist(Long userId);
}