package com.borrowbay.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.borrowbay.domain.NotificationType;
import com.borrowbay.domain.OrderStatus;
import com.borrowbay.domain.PaymentStatus;
import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.DeliveryPartnerProfile;
import com.borrowbay.model.Notification;
import com.borrowbay.model.Order;
import com.borrowbay.model.OrderItem;
import com.borrowbay.model.Payment;
import com.borrowbay.model.User;
import com.borrowbay.repository.DeliveryPartnerProfileRepository;
import com.borrowbay.repository.NotificationRepository;
import com.borrowbay.repository.OrderRepository;
import com.borrowbay.repository.PaymentRepository;
import com.borrowbay.request.RazorpayOrderRequest;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.response.RazorpayOrderResponse;
import com.borrowbay.service.RazorpayService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/razorpay")
@RequiredArgsConstructor
public class RazorpayController {

    private final RazorpayService razorpayService;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final DeliveryPartnerProfileRepository deliveryPartnerProfileRepository;
    private final NotificationRepository notificationRepository;

    @PostMapping("/create-order")
    public ResponseEntity<RazorpayOrderResponse> createOrder(
            @RequestBody RazorpayOrderRequest req) {
        return ResponseEntity.ok(razorpayService.createRazorpayOrder(req));
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse> verifyPayment(
            @RequestParam String razorpayOrderId,
            @RequestParam String razorpayPaymentId,
            @RequestParam String razorpaySignature,
            @RequestParam Long paymentId) {

        boolean isValid = razorpayService.verifyPayment(
                razorpayOrderId, razorpayPaymentId, razorpaySignature);

        if (isValid) {
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new BorrowBayException("Payment not found"));

            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setPaymentGatewayId(razorpayPaymentId);
            paymentRepository.save(payment);

            Order order = payment.getOrder();
            order.setStatus(OrderStatus.CONFIRMED);
            // After order.setStatus(OrderStatus.CONFIRMED)
// Notify each seller
for (OrderItem orderItem : order.getItems()) {
    if (orderItem.getItem() != null &&
        orderItem.getItem().getSeller() != null) {

        User seller = orderItem.getItem().getSeller();

        Notification sellerNotif = new Notification();
        sellerNotif.setMessage(
            "🎉 Your item \"" + orderItem.getItem().getTitle() +
            "\" has been rented! Order #" + order.getId() +
            ". Rental period: " + orderItem.getRentalStartDate() +
            " to " + orderItem.getRentalEndDate() +
            ". Please keep the item ready for pickup.");
        sellerNotif.setType(NotificationType.ORDER_CONFIRMED);
        sellerNotif.setUser(seller);
        sellerNotif.setIsRead(false);
        notificationRepository.save(sellerNotif);
    }
}
            orderRepository.save(order);

            // Notify available delivery partners in the customer's city
            String city = order.getDeliveryAddress().getCity();
            List<DeliveryPartnerProfile> availablePartners =
                    deliveryPartnerProfileRepository
                        .findByIsAvailableTrueAndIsVerifiedTrueAndCityIgnoreCase(city);

            for (DeliveryPartnerProfile partner : availablePartners) {
                Notification notification = new Notification();
                notification.setMessage(
                    "🚚 New delivery job available! Order #" + order.getId() +
                    " in " + city + ". Open your dashboard to accept.");
                notification.setType(NotificationType.DELIVERY_ASSIGNED);
                notification.setUser(partner.getUser());
                notification.setIsRead(false);
                notificationRepository.save(notification);
            }

            return ResponseEntity.ok(
                    new ApiResponse("Payment verified successfully", true));
        }

        return ResponseEntity.badRequest()
                .body(new ApiResponse("Payment verification failed", false));
    }
}