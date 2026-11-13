package com.borrowbay.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.RentalHistory;

import jakarta.transaction.Transactional;

public interface RentalHistoryRepository extends JpaRepository<RentalHistory, Long> {
    List<RentalHistory> findByCustomerId(Long customerId);
    List<RentalHistory> findByItemId(Long itemId);
    Boolean existsByCustomerIdAndItemId(Long customerId, Long itemId);
    @Transactional
void deleteByItemId(Long itemId);

}