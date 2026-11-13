package com.borrowbay.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.Refund;
import com.borrowbay.domain.RefundStatus;

public interface RefundRepository extends JpaRepository<Refund, Long> {
    Optional<Refund> findByPaymentId(Long paymentId);
    List<Refund> findByCustomerId(Long customerId);
    List<Refund> findByStatus(RefundStatus status);
}