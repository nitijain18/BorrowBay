package com.borrowbay.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.borrowbay.model.ItemAvailabilityBlock;

import jakarta.transaction.Transactional;

public interface ItemAvailabilityBlockRepository
        extends JpaRepository<ItemAvailabilityBlock, Long> {

    List<ItemAvailabilityBlock> findByItemId(Long itemId);

    @Transactional
    @Modifying
    void deleteByItemId(Long itemId);

    @Transactional
    @Modifying
    void deleteByOrderId(Long orderId);   // ← add annotations

    @Query("SELECT COUNT(b) FROM ItemAvailabilityBlock b " +
           "WHERE b.item.id = :itemId " +
           "AND b.blockedFrom <= :endDate " +
           "AND b.blockedTill >= :startDate")
    Long countBlockedDates(
            @Param("itemId") Long itemId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}