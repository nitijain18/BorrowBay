package com.borrowbay.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.CartItem;

import jakarta.transaction.Transactional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartId(Long cartId);
    Optional<CartItem> findByCartIdAndItemId(Long cartId, Long itemId);
    @Transactional
        void deleteByCartId(Long cartId);
        @Transactional
    void deleteByItemId(Long itemId);
}