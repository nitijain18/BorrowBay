package com.borrowbay.service;

import java.util.List;
import com.borrowbay.domain.OrderStatus;
import com.borrowbay.model.Order;

public interface OrderService {
    Order placeOrder(Long userId, Long addressId);
    Order findById(Long id);
    List<Order> findAll();
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByStatus(OrderStatus status);
    Order updateStatus(Long id, OrderStatus status);
    void cancelOrder(Long id);
    List<Order> findBySellerId(Long sellerId);
}