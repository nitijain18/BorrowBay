package com.borrowbay.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserId(Long userId);
    List<Transaction> findByPaymentId(Long paymentId);
    Optional<Transaction> findByTransactionId(String transactionId);
}