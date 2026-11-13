package com.borrowbay.service.impl;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.borrowbay.service.EmailService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendOtpEmail(String toEmail, String otp) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("BorrowBay — Your OTP Verification Code");
        message.setText(
            "Hello!\n\n" +
            "Your BorrowBay verification code is: " + otp + "\n\n" +
            "This OTP is valid for 10 minutes.\n" +
            "Do not share this code with anyone.\n\n" +
            "Team BorrowBay"
        );

        mailSender.send(message);
    }
}