package com.borrowbay.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.service.CouponService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CouponUsageRepository couponUsageRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Override
    public Coupon createCoupon(Coupon req) {
        if (couponRepository.findByCode(req.getCode()).isPresent())
            throw new BorrowBayException("Coupon code already exists");
        req.setIsActive(true);
        return couponRepository.save(req);
    }

    @Override
    public Coupon findById(Long id) {
        return couponRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Coupon not found with id " + id));
    }

    @Override
    public List<Coupon> findAllActive() {
        return couponRepository.findByIsActiveTrue();
    }

    @Override
    public Coupon validateCoupon(String code, Long userId) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new BorrowBayException("Invalid coupon code"));
        if (!coupon.getIsActive())
            throw new BorrowBayException("Coupon is no longer active");
        if (couponUsageRepository.existsByCouponIdAndUserId(coupon.getId(), userId))
            throw new BorrowBayException("You have already used this coupon");
        return coupon;
    }

    @Override
    public void applyCoupon(String code, Long userId, Long orderId) {
        Coupon coupon = validateCoupon(code, userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BorrowBayException("User not found"));
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BorrowBayException("Order not found"));

        double discount = (order.getTotalRentAmount() * coupon.getDiscountPercent()) / 100;
        if (discount > coupon.getMaxDiscountAmount()) discount = coupon.getMaxDiscountAmount();

        CouponUsage usage = new CouponUsage();
        usage.setCoupon(coupon);
        usage.setUser(user);
        usage.setOrder(order);
        usage.setDiscountApplied(discount);
        usage.setUsedAt(LocalDateTime.now());
        couponUsageRepository.save(usage);
    }

    @Override
    public Coupon deactivateCoupon(Long id) {
        Coupon coupon = findById(id);
        coupon.setIsActive(false);
        return couponRepository.save(coupon);
    }

    @Override
    public void deleteCoupon(Long id) {
        couponRepository.delete(findById(id));
    }
}