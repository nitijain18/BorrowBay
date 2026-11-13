package com.borrowbay.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.Wishlist;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Optional<Wishlist> findByUserId(Long userId);
}