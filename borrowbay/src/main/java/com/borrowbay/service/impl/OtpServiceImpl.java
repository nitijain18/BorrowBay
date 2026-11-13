package com.borrowbay.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.OtpVerification;
import com.borrowbay.repository.OtpVerificationRepository;
import com.borrowbay.repository.UserRepository;
import com.borrowbay.service.EmailService;
import com.borrowbay.service.OtpService;
import com.borrowbay.util.OtpUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final OtpVerificationRepository otpRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void sendOtp(String email) {

        if (!userRepository.existsByEmail(email)) {
            throw new BorrowBayException("No account found with email: " + email);
        }

        // Delete old OTPs first
        otpRepository.deleteByEmail(email);

        String otp = OtpUtil.generateOtp();

        OtpVerification otpVerification = new OtpVerification();
        otpVerification.setEmail(email);
        otpVerification.setOtp(otp);
        otpVerification.setIsVerified(false);
        otpVerification.setCreatedAt(LocalDateTime.now());
        otpVerification.setExpiresAt(LocalDateTime.now().plusMinutes(10));

        otpRepository.save(otpVerification);
        emailService.sendOtpEmail(email, otp);
    }

    @Override
    @Transactional
    public boolean verifyOtp(String email, String otp) {

        // Get all OTPs for this email — handles duplicates
        List<OtpVerification> otpList = otpRepository.findByEmail(email);

        if (otpList.isEmpty()) {
            throw new BorrowBayException("No OTP found for: " + email
                    + " — please request a new OTP");
        }

        // Use the latest one
        OtpVerification otpVerification = otpList.get(otpList.size() - 1);

        // Check expiry
        if (LocalDateTime.now().isAfter(otpVerification.getExpiresAt())) {
            otpRepository.deleteByEmail(email);
            throw new BorrowBayException("OTP has expired — please request a new one");
        }

        // Check OTP matches
        if (!otpVerification.getOtp().equals(otp)) {
            throw new BorrowBayException("Invalid OTP — please try again");
        }

        otpVerification.setIsVerified(true);
        otpRepository.save(otpVerification);

        // Clean up after verify
        otpRepository.deleteByEmail(email);

        return true;
    }
}