package com.borrowbay.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RazorpayOrderResponse {
    private String razorpayOrderId;  // Razorpay's order id e.g. "order_xxxxx"
    private Double amount;           // amount in rupees
    private String currency;         // "INR"
    private String keyId;            // sent to frontend to initialize payment
}