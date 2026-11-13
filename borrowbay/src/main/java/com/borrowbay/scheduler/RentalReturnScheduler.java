package com.borrowbay.scheduler;

import java.time.LocalDate;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.borrowbay.domain.NotificationType;
import com.borrowbay.domain.OrderStatus;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class RentalReturnScheduler {

    private final OrderRepository orderRepository;
    private final NotificationRepository notificationRepository;

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional                    // ← ADD THIS
    public void checkRentalReturns() {
        log.info("Checking rental returns...");

        LocalDate today = LocalDate.now();

        List<Order> deliveredOrders = orderRepository
                .findByStatus(OrderStatus.DELIVERED_TO_CUSTOMER);

        for (Order order : deliveredOrders) {
            // Force load items within transaction
            order.getItems().size();

            boolean rentalEnded = order.getItems().stream()
                    .anyMatch(oi ->
                        oi.getRentalEndDate() != null &&
                        !oi.getRentalEndDate().isAfter(today));

            if (rentalEnded) {
                log.info("Rental ended for order #{}", order.getId());

                order.setStatus(OrderStatus.RETURN_REQUESTED);
                orderRepository.save(order);

                // Notify customer
                Notification customerNotif = new Notification();
                customerNotif.setMessage(
                    "📦 Your rental period for Order #" + order.getId() +
                    " has ended! Please keep the item(s) ready for pickup. " +
                    "A delivery partner will collect them soon.");
                customerNotif.setType(NotificationType.RETURN_INITIATED);
                customerNotif.setUser(order.getCustomer());
                customerNotif.setIsRead(false);
                notificationRepository.save(customerNotif);

                // Notify each seller
                for (OrderItem orderItem : order.getItems()) {
                    if (orderItem.getItem() != null &&
                        orderItem.getItem().getSeller() != null) {

                        Notification sellerNotif = new Notification();
                        sellerNotif.setMessage(
                            "🔔 Rental period ended for Order #" +
                            order.getId() + ". Item \"" +
                            orderItem.getItem().getTitle() +
                            "\" return has been automatically requested. " +
                            "A delivery partner will bring it back to you.");
                        sellerNotif.setType(NotificationType.RETURN_INITIATED);
                        sellerNotif.setUser(orderItem.getItem().getSeller());
                        sellerNotif.setIsRead(false);
                        notificationRepository.save(sellerNotif);
                    }
                }
            }
        }

        log.info("Rental return check completed.");
    }
}