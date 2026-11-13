package com.borrowbay.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.borrowbay.model.Order;
import com.borrowbay.domain.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByCustomerIdAndStatus(Long customerId, OrderStatus status);
    List<Order> findByStatusAndDeliveryAddressCityIgnoreCase(
        OrderStatus status, String city);
        @Query("SELECT DISTINCT o FROM Order o " +
       "JOIN o.items oi " +
       "JOIN oi.item i " +
       "WHERE i.seller.id = :sellerId " +
       "ORDER BY o.orderDate DESC")
List<Order> findByItemsSellerId(@Param("sellerId") Long sellerId);
}