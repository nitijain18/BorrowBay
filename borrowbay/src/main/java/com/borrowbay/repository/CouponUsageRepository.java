package com.borrowbay.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.CouponUsage;

public interface CouponUsageRepository extends JpaRepository<CouponUsage, Long> {
    Optional<CouponUsage> findByCouponIdAndUserId(Long couponId, Long userId);
    Boolean existsByCouponIdAndUserId(Long couponId, Long userId);
}