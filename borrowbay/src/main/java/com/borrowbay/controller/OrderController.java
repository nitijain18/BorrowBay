package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.domain.OrderStatus;
import com.borrowbay.model.Order;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.OrderService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/place/{userId}")
    public ResponseEntity<Order> placeOrder(@PathVariable Long userId,
                                             @RequestParam Long addressId) {
        return ResponseEntity.ok(orderService.placeOrder(userId, addressId));
    }

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.findById(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getOrdersByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(orderService.findByCustomerId(customerId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(orderService.findByStatus(status));
    }
    @GetMapping("/seller/{sellerId}")
public ResponseEntity<List<Order>> getOrdersBySeller(
        @PathVariable Long sellerId) {
    return ResponseEntity.ok(
        orderService.findBySellerId(sellerId));
}

    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(@PathVariable Long id,
                                               @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.ok(new ApiResponse("Order cancelled successfully", true));
    }
}