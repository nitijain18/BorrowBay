package com.borrowbay.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.Payment;
import com.borrowbay.domain.PaymentStatus;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long orderId);
    List<Payment> findByUserId(Long userId);
    List<Payment> findByStatus(PaymentStatus status);
    Optional<Payment> findByPaymentGatewayId(String gatewayId);
}