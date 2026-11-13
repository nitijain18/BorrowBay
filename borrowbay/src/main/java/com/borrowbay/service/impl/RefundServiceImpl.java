package com.borrowbay.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.domain.RefundStatus;
import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.service.RefundService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    @Override
    public Refund initiateRefund(Refund req) {
        Payment payment = paymentRepository.findById(req.getPayment().getId())
                .orElseThrow(() -> new BorrowBayException("Payment not found"));
        User customer = userRepository.findById(req.getCustomer().getId())
                .orElseThrow(() -> new BorrowBayException("User not found"));

        Refund refund = new Refund();
        refund.setRefundAmount(req.getRefundAmount());
        refund.setReason(req.getReason());
        refund.setStatus(RefundStatus.PENDING);
        refund.setPayment(payment);
        refund.setCustomer(customer);
        refund.setInitiatedAt(LocalDateTime.now());
        return refundRepository.save(refund);
    }

    @Override
    public Refund findById(Long id) {
        return refundRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Refund not found with id " + id));
    }

    @Override
    public List<Refund> findAll() {
        return refundRepository.findAll();
    }

    @Override
    public List<Refund> findByCustomerId(Long customerId) {
        return refundRepository.findByCustomerId(customerId);
    }

    @Override
    public List<Refund> findByStatus(RefundStatus status) {
        return refundRepository.findByStatus(status);
    }

    @Override
    public Refund approveRefund(Long id) {
        Refund refund = findById(id);
        refund.setStatus(RefundStatus.COMPLETED);
        refund.setResolvedAt(LocalDateTime.now());
        return refundRepository.save(refund);
    }

    @Override
    public Refund rejectRefund(Long id) {
        Refund refund = findById(id);
        refund.setStatus(RefundStatus.REJECTED);
        refund.setResolvedAt(LocalDateTime.now());
        return refundRepository.save(refund);
    }

    @Override
    public void deleteRefund(Long id) {
        refundRepository.delete(findById(id));
    }
}