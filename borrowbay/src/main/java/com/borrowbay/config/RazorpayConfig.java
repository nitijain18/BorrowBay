package com.borrowbay.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

@Configuration
public class RazorpayConfig {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Bean
    public RazorpayClient razorpayClient() throws RazorpayException {
        // RazorpayClient is the main object used to
        // create orders and verify payments
        return new RazorpayClient(keyId, keySecret);
    }
}