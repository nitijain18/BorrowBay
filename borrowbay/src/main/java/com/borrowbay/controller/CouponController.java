package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.model.Coupon;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.CouponService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon req) {
        return ResponseEntity.ok(couponService.createCoupon(req));
    }

    @GetMapping
    public ResponseEntity<List<Coupon>> getAllActiveCoupons() {
        return ResponseEntity.ok(couponService.findAllActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Coupon> getCouponById(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.findById(id));
    }

    @GetMapping("/validate/{code}")
    public ResponseEntity<Coupon> validateCoupon(@PathVariable String code,
                                                   @RequestParam Long userId) {
        return ResponseEntity.ok(couponService.validateCoupon(code, userId));
    }

    @PostMapping("/apply")
    public ResponseEntity<ApiResponse> applyCoupon(@RequestParam String code,
                                                    @RequestParam Long userId,
                                                    @RequestParam Long orderId) {
        couponService.applyCoupon(code, userId, orderId);
        return ResponseEntity.ok(new ApiResponse("Coupon applied successfully", true));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Coupon> deactivateCoupon(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.deactivateCoupon(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(new ApiResponse("Coupon deleted successfully", true));
    }
}