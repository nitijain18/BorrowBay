package com.borrowbay.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.OtpService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/otp")
@RequiredArgsConstructor
public class OtpController {

    private final OtpService otpService;

    // Step 1 — Send OTP to email
    // POST /otp/send?email=rahul@gmail.com
    @PostMapping("/send")
    public ResponseEntity<ApiResponse> sendOtp(@RequestParam String email) {
        otpService.sendOtp(email);
        return ResponseEntity.ok(
            new ApiResponse("OTP sent to " + email, true));
    }

    // Step 2 — Verify OTP entered by user
    // POST /otp/verify?email=rahul@gmail.com&otp=847291
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse> verifyOtp(
            @RequestParam String email,
            @RequestParam String otp) {
        boolean verified = otpService.verifyOtp(email, otp);
        if (verified) {
            return ResponseEntity.ok(
                new ApiResponse("Email verified successfully", true));
        }
        return ResponseEntity.badRequest()
                .body(new ApiResponse("OTP verification failed", false));
    }
}