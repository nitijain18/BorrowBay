package com.borrowbay.service.impl;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.request.RazorpayOrderRequest;
import com.borrowbay.response.RazorpayOrderResponse;
import com.borrowbay.service.RazorpayService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RazorpayServiceImpl implements RazorpayService {

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    @Override
    public RazorpayOrderResponse createRazorpayOrder(RazorpayOrderRequest req) {
        try {
            // Razorpay takes amount in PAISE (not rupees)
            // Rs 2000 = 200000 paise
            int amountInPaise = (int)(req.getAmount() * 100);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "borrowbay_order_" + req.getOrderId());
            // receipt = your internal reference id

            // Create order on Razorpay
            Order razorpayOrder = razorpayClient.orders.create(orderRequest);

            // Return details to frontend
            return new RazorpayOrderResponse(
                    razorpayOrder.get("id"),      // e.g. "order_xxxxxxxxxxxxx"
                    req.getAmount(),
                    "INR",
                    keyId  // frontend needs this to show payment popup
            );

        } catch (RazorpayException e) {
            throw new BorrowBayException("Failed to create Razorpay order: "
                    + e.getMessage());
        }
    }

    @Override
    public boolean verifyPayment(String razorpayOrderId,
                                  String razorpayPaymentId,
                                  String razorpaySignature) {
        try {
            // Razorpay sends a signature after payment
            // We verify it to confirm payment is genuine
            // Signature = HMAC-SHA256(orderId + "|" + paymentId, keySecret)

            String data = razorpayOrderId + "|" + razorpayPaymentId;

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(
                    keySecret.getBytes(), "HmacSHA256");
            mac.init(secretKey);

            byte[] hash = mac.doFinal(data.getBytes());

            // Convert bytes to hex string
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            // Compare our computed signature with Razorpay's signature
            return hexString.toString().equals(razorpaySignature);

        } catch (Exception e) {
            throw new BorrowBayException("Payment verification failed: "
                    + e.getMessage());
        }
    }
}