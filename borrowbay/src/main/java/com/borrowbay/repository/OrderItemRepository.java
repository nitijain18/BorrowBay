package com.borrowbay.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.borrowbay.domain.OrderStatus;
import com.borrowbay.model.OrderItem;

import jakarta.transaction.Transactional;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    List<OrderItem> findByItemId(Long itemId);

    List<OrderItem> findByStatus(OrderStatus status);

    // Check if customer has ordered this item (excluding cancelled orders)
    boolean existsByItemIdAndOrderCustomerIdAndOrderStatusNot(
            Long itemId, Long customerId, OrderStatus status);

    @Transactional
    @Modifying
    @Query("UPDATE OrderItem oi SET oi.item = null WHERE oi.item.id = :itemId")
    void nullifyItemReference(@Param("itemId") Long itemId);
}