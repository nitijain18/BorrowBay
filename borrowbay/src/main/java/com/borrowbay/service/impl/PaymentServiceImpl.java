package com.borrowbay.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.domain.PaymentStatus;
import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.service.PaymentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public Payment createPayment(Payment req) {
        if (req.getOrder() == null || req.getOrder().getId() == null)
            throw new BorrowBayException("Order id is required");
        if (req.getUser() == null || req.getUser().getId() == null)
            throw new BorrowBayException("User id is required");

        Order order = orderRepository.findById(req.getOrder().getId())
                .orElseThrow(() -> new BorrowBayException("Order not found"));
        User user = userRepository.findById(req.getUser().getId())
                .orElseThrow(() -> new BorrowBayException("User not found"));

        Payment payment = new Payment();
        payment.setRentAmount(req.getRentAmount());
        payment.setDepositAmount(req.getDepositAmount());
        payment.setTotalAmount(req.getRentAmount() + req.getDepositAmount());
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaymentGatewayId(req.getPaymentGatewayId());
        payment.setPaymentMethod(req.getPaymentMethod());
        payment.setOrder(order);
        payment.setUser(user);
        payment.setPaidAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        Transaction transaction = new Transaction();
        transaction.setTransactionId(req.getPaymentGatewayId());
        transaction.setGateway("Razorpay");
        transaction.setAmount(savedPayment.getTotalAmount());
        transaction.setType("PAYMENT");
        transaction.setPayment(savedPayment);
        transaction.setUser(user);
        transaction.setTimestamp(LocalDateTime.now());
        transactionRepository.save(transaction);

        return savedPayment;
    }

    @Override
    public Payment findById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Payment not found with id " + id));
    }

    @Override
    public Payment findByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new BorrowBayException("Payment not found for order " + orderId));
    }

    @Override
    public List<Payment> findByUserId(Long userId) {
        return paymentRepository.findByUserId(userId);
    }

    @Override
    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    @Override
    public Payment updateStatus(Long id, PaymentStatus status) {
        Payment payment = findById(id);
        payment.setStatus(status);
        return paymentRepository.save(payment);
    }

    @Override
    public void deletePayment(Long id) {
        paymentRepository.delete(findById(id));
    }
}