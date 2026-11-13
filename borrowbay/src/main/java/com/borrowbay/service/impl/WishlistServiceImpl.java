package com.borrowbay.service.impl;

import java.util.HashSet;

import org.springframework.stereotype.Service;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.service.WishlistService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;

    @Override
    public Wishlist getOrCreateWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BorrowBayException("User not found"));
            Wishlist wishlist = new Wishlist();
            wishlist.setUser(user);
            wishlist.setItems(new HashSet<>());
            return wishlistRepository.save(wishlist);
        });
    }

    @Override
    public Wishlist addItem(Long userId, Long itemId) {
        Wishlist wishlist = getOrCreateWishlist(userId);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new BorrowBayException("Item not found"));
        wishlist.getItems().add(item);
        return wishlistRepository.save(wishlist);
    }

    @Override
    public Wishlist removeItem(Long userId, Long itemId) {
        Wishlist wishlist = wishlistRepository.findByUserId(userId)
                .orElseThrow(() -> new BorrowBayException("Wishlist not found"));
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new BorrowBayException("Item not found"));
        wishlist.getItems().remove(item);
        return wishlistRepository.save(wishlist);
    }

    @Override
    public void clearWishlist(Long userId) {
        Wishlist wishlist = wishlistRepository.findByUserId(userId)
                .orElseThrow(() -> new BorrowBayException("Wishlist not found"));
        wishlist.getItems().clear();
        wishlistRepository.save(wishlist);
    }
}