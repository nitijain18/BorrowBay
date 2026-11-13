package com.borrowbay.service;

import java.util.List;
import com.borrowbay.model.Coupon;

public interface CouponService {
    Coupon createCoupon(Coupon req);
    Coupon findById(Long id);
    List<Coupon> findAllActive();
    Coupon validateCoupon(String code, Long userId);
    void applyCoupon(String code, Long userId, Long orderId);
    Coupon deactivateCoupon(Long id);
    void deleteCoupon(Long id);
}