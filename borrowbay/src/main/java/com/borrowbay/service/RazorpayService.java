package com.borrowbay.service;

import com.borrowbay.request.RazorpayOrderRequest;
import com.borrowbay.response.RazorpayOrderResponse;

public interface RazorpayService {
    RazorpayOrderResponse createRazorpayOrder(RazorpayOrderRequest req);
    boolean verifyPayment(String razorpayOrderId,
                          String razorpayPaymentId,
                          String razorpaySignature);
}