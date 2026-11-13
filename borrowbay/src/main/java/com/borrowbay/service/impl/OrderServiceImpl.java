package com.borrowbay.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.domain.NotificationType;
import com.borrowbay.domain.OrderStatus;
import com.borrowbay.domain.RefundStatus;
import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.service.OrderService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final ItemAvailabilityBlockRepository availabilityBlockRepository;
    private final RentalHistoryRepository rentalHistoryRepository;
    private final RefundRepository refundRepository;
    private final ItemRepository itemRepository;
    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public Order placeOrder(Long userId, Long addressId) {
        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new BorrowBayException("User not found"));
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BorrowBayException("Cart not found"));
        if (cart.getCartItems().isEmpty())
            throw new BorrowBayException("Cart is empty");

        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new BorrowBayException("Address not found"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus(OrderStatus.PENDING);
        order.setDeliveryAddress(address);
        order.setOrderDate(LocalDateTime.now());

        List<OrderItem> orderItems = new ArrayList<>();
        double totalRent = 0.0;
        double totalDeposit = 0.0;

        for (CartItem cartItem : cart.getCartItems()) {
            Long blockedCount = availabilityBlockRepository.countBlockedDates(
                    cartItem.getItem().getId(),
                    cartItem.getRentalStartDate(),
                    cartItem.getRentalEndDate());
            if (blockedCount > 0)
                throw new BorrowBayException(
                        cartItem.getItem().getTitle() + " is not available for selected dates");

            OrderItem orderItem = new OrderItem();
            orderItem.setItem(cartItem.getItem());
            orderItem.setOrder(order);
            orderItem.setRentalStartDate(cartItem.getRentalStartDate());
            orderItem.setRentalEndDate(cartItem.getRentalEndDate());
            orderItem.setRentalDays(cartItem.getRentalDays());
            orderItem.setRentAmount(cartItem.getRentAmount());
            orderItem.setDepositAmount(cartItem.getDepositAmount());
            orderItem.setStatus(OrderStatus.PENDING);
            orderItems.add(orderItem);
            totalRent += cartItem.getRentAmount();
            totalDeposit += cartItem.getDepositAmount();
        }

        order.setItems(orderItems);
        order.setTotalRentAmount(totalRent);
        order.setTotalDeposit(totalDeposit);
        order.setPlatformCommission(totalRent * 0.10);

        Order savedOrder = orderRepository.save(order);

        for (OrderItem orderItem : savedOrder.getItems()) {
            ItemAvailabilityBlock block = new ItemAvailabilityBlock();
            block.setItem(orderItem.getItem());
            block.setOrder(savedOrder);
            block.setBlockedFrom(orderItem.getRentalStartDate());
            block.setBlockedTill(orderItem.getRentalEndDate());
            availabilityBlockRepository.save(block);

            RentalHistory history = new RentalHistory();
            history.setCustomer(customer);
            history.setItem(orderItem.getItem());
            history.setOrder(savedOrder);
            history.setRentedFrom(orderItem.getRentalStartDate());
            history.setRentedTill(orderItem.getRentalEndDate());
            history.setTotalPaid(orderItem.getRentAmount() + orderItem.getDepositAmount());
            rentalHistoryRepository.save(history);
        }

        cartItemRepository.deleteByCartId(cart.getId());
        cart.getCartItems().clear();
        cart.setTotalRentAmount(0.0);
        cart.setTotalDeposit(0.0);
        cartRepository.save(cart);

        return savedOrder;
    }

    @Override
    public Order findById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Order not found with id " + id));
    }

    @Override
    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    @Override
    public List<Order> findByCustomerId(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    @Override
    public List<Order> findByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    @Override
    public Order updateStatus(Long id, OrderStatus status) {
        Order order = findById(id);
        order.setStatus(status);
        return orderRepository.save(order);
    }
    @Override
public List<Order> findBySellerId(Long sellerId) {
    return orderRepository.findByItemsSellerId(sellerId);
}

    @Override
    @Transactional
    public void cancelOrder(Long orderId) {
        Order order = findById(orderId);

        if (order.getStatus() == OrderStatus.DELIVERED_TO_CUSTOMER ||
            order.getStatus() == OrderStatus.COMPLETED) {
            throw new BorrowBayException("Cannot cancel order after delivery");
        }

        // Calculate refund percentage based on hours since order
        long hoursElapsed = java.time.Duration.between(
                order.getOrderDate(),
                LocalDateTime.now()).toHours();

        double refundPercent;
        String refundMsg;

        if (hoursElapsed <= 2) {
            refundPercent = 100;
            refundMsg = "Full refund (100%)";
        } else if (hoursElapsed <= 24) {
            refundPercent = 90;
            refundMsg = "90% refund";
        } else if (hoursElapsed <= 48) {
            refundPercent = 75;
            refundMsg = "75% refund";
        } else if (hoursElapsed <= 72) {
            refundPercent = 50;
            refundMsg = "50% refund";
        } else {
            refundPercent = 25;
            refundMsg = "25% refund (late cancellation)";
        }

        double totalPaid = order.getTotalRentAmount() + order.getTotalDeposit();
        double refundAmount = totalPaid * refundPercent / 100;

        // Update order status
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Remove availability blocks so dates become free again
        availabilityBlockRepository.deleteByOrderId(orderId);

        // Free up items
        for (OrderItem orderItem : order.getItems()) {
            if (orderItem.getItem() != null) {
                Item item = itemRepository.findById(orderItem.getItem().getId())
                        .orElse(null);
                if (item != null) {
                    item.setIsAvailable(true);
                    itemRepository.save(item);
                }
            }
        }

        // Create refund record
        Refund refund = new Refund();
        refund.setCustomer(order.getCustomer());
        refund.setRefundAmount(refundAmount);
        refund.setReason("Order #" + orderId + " cancelled. " + refundMsg);
        refund.setStatus(RefundStatus.PENDING);
        refundRepository.save(refund);

        // Notify customer
        Notification notification = new Notification();
        notification.setMessage(
            "❌ Order #" + orderId + " cancelled. " +
            refundMsg + " — ₹" + String.format("%.0f", refundAmount) +
            " will be refunded within 5-7 business days.");
        notification.setType(NotificationType.REFUND_PROCESSED);
        notification.setUser(order.getCustomer());
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }
}