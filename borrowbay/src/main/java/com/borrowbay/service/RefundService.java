package com.borrowbay.service;

import java.util.List;
import com.borrowbay.domain.RefundStatus;
import com.borrowbay.model.Refund;

public interface RefundService {
    Refund initiateRefund(Refund req);
    Refund findById(Long id);
    List<Refund> findAll();
    List<Refund> findByCustomerId(Long customerId);
    List<Refund> findByStatus(RefundStatus status);
    Refund approveRefund(Long id);
    Refund rejectRefund(Long id);
    void deleteRefund(Long id);
}