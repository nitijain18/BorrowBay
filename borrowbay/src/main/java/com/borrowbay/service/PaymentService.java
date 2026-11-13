package com.borrowbay.service;

import java.util.List;
import com.borrowbay.domain.PaymentStatus;
import com.borrowbay.model.Payment;

public interface PaymentService {
    Payment createPayment(Payment req);
    Payment findById(Long id);
    Payment findByOrderId(Long orderId);
    List<Payment> findByUserId(Long userId);
    List<Payment> findAll();
    Payment updateStatus(Long id, PaymentStatus status);
    void deletePayment(Long id);
}