package com.borrowbay.service.impl;

import org.springframework.stereotype.Service;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.Cart;
import com.borrowbay.model.CartItem;
import com.borrowbay.model.Item;
import com.borrowbay.model.User;
import com.borrowbay.repository.CartItemRepository;
import com.borrowbay.repository.CartRepository;
import com.borrowbay.repository.ItemRepository;
import com.borrowbay.repository.UserRepository;
import com.borrowbay.service.CartService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;

    @Override
    public Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new BorrowBayException("User not found"));
            Cart newCart = new Cart();
            newCart.setUser(user);
            newCart.setTotalRentAmount(0.0);
            newCart.setTotalDeposit(0.0);
            return cartRepository.save(newCart);
        });
    }

    @Override
    public Cart addItemToCart(Long userId, Long itemId, CartItem req) {
        Cart cart = getOrCreateCart(userId);
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new BorrowBayException("Item not found"));

        if (!item.getIsAvailable())
            throw new BorrowBayException("Item is not available for rent");

        if (cartItemRepository.findByCartIdAndItemId(cart.getId(), itemId).isPresent())
            throw new BorrowBayException("Item already in cart");

        int rentalDays = (int)(req.getRentalEndDate().toEpochDay() -
                                req.getRentalStartDate().toEpochDay());
        if (rentalDays <= 0)
            throw new BorrowBayException("Invalid rental dates");

        CartItem cartItem = new CartItem();
        cartItem.setItem(item);
        cartItem.setCart(cart);
        cartItem.setRentalStartDate(req.getRentalStartDate());
        cartItem.setRentalEndDate(req.getRentalEndDate());
        cartItem.setRentalDays(rentalDays);
        cartItem.setRentAmount(item.getRentPricePerDay() * rentalDays);
        cartItem.setDepositAmount(item.getSecurityDeposit());
        cart.getCartItems().add(cartItem);

        recalculateTotals(cart);
        return cartRepository.save(cart);
    }

    @Override
    public Cart removeItemFromCart(Long userId, Long itemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BorrowBayException("Cart not found"));
        CartItem cartItem = cartItemRepository.findByCartIdAndItemId(cart.getId(), itemId)
                .orElseThrow(() -> new BorrowBayException("Item not in cart"));

        cart.getCartItems().remove(cartItem);
        cartItemRepository.delete(cartItem);
        recalculateTotals(cart);
        return cartRepository.save(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BorrowBayException("Cart not found"));
        cartItemRepository.deleteByCartId(cart.getId());
        cart.getCartItems().clear();
        cart.setTotalRentAmount(0.0);
        cart.setTotalDeposit(0.0);
        cartRepository.save(cart);
    }

    private void recalculateTotals(Cart cart) {
        double totalRent = cart.getCartItems().stream()
                .mapToDouble(ci -> ci.getRentAmount() != null ? ci.getRentAmount() : 0).sum();
        double totalDeposit = cart.getCartItems().stream()
                .mapToDouble(ci -> ci.getDepositAmount() != null ? ci.getDepositAmount() : 0).sum();
        cart.setTotalRentAmount(totalRent);
        cart.setTotalDeposit(totalDeposit);
    }
}