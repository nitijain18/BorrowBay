package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.domain.PaymentStatus;
import com.borrowbay.model.Payment;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.PaymentService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Payment> createPayment(@RequestBody Payment req) {
        return ResponseEntity.ok(paymentService.createPayment(req));
    }

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.findById(id));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getPaymentByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.findByOrderId(orderId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Payment>> getPaymentsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.findByUserId(userId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Payment> updateStatus(@PathVariable Long id,
                                                 @RequestParam PaymentStatus status) {
        return ResponseEntity.ok(paymentService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok(new ApiResponse("Payment deleted successfully", true));
    }
}