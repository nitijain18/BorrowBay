package com.borrowbay.service;

import com.borrowbay.model.Cart;
import com.borrowbay.model.CartItem;

public interface CartService {
    Cart getOrCreateCart(Long userId);
    Cart addItemToCart(Long userId, Long itemId, CartItem req);
    Cart removeItemFromCart(Long userId, Long itemId);
    void clearCart(Long userId);
}