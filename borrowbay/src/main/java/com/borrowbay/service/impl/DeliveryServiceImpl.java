package com.borrowbay.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.domain.DeliveryStatus;
import com.borrowbay.domain.NotificationType;
import com.borrowbay.domain.OrderStatus;
import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.service.DeliveryService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private final NotificationRepository notificationRepository;
    private final DeliveryRequestRepository deliveryRequestRepository;
    private final PickupRequestRepository pickupRequestRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final DeliveryPartnerProfileRepository deliveryPartnerProfileRepository;
    private final SellerProfileRepository sellerProfileRepository;

    @Override
    public DeliveryRequest createDelivery(DeliveryRequest req) {
        Order order = orderRepository.findById(req.getOrder().getId())
                .orElseThrow(() -> new BorrowBayException("Order not found"));
        User partner = userRepository.findById(req.getDeliveryPartner().getId())
                .orElseThrow(() -> new BorrowBayException("Delivery partner not found"));
        Address pickup = addressRepository.findById(req.getPickupAddress().getId())
                .orElseThrow(() -> new BorrowBayException("Pickup address not found"));
        Address drop = addressRepository.findById(req.getDropAddress().getId())
                .orElseThrow(() -> new BorrowBayException("Drop address not found"));

        DeliveryRequest delivery = new DeliveryRequest();
        delivery.setOrder(order);
        delivery.setDeliveryPartner(partner);
        delivery.setPickupAddress(pickup);
        delivery.setDropAddress(drop);
        delivery.setStatus(DeliveryStatus.ASSIGNED);
        delivery.setAssignedAt(LocalDateTime.now());
        return deliveryRequestRepository.save(delivery);
    }

    @Override
    public DeliveryRequest findDeliveryById(Long id) {
        return deliveryRequestRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Delivery not found with id " + id));
    }

    @Override
    public List<DeliveryRequest> findAllDeliveries() {
        return deliveryRequestRepository.findAll();
    }

    @Override
    public List<DeliveryRequest> findDeliveriesByPartner(Long partnerId) {
        // partnerId here is the PROFILE id — get the user id first
        DeliveryPartnerProfile profile = deliveryPartnerProfileRepository
                .findById(partnerId)
                .orElseThrow(() -> new BorrowBayException("Partner not found"));
        return deliveryRequestRepository
                .findByDeliveryPartnerId(profile.getUser().getId());
    }

    @Override
    @Transactional
    public DeliveryRequest updateDeliveryStatus(Long id, DeliveryStatus status) {
        DeliveryRequest delivery = findDeliveryById(id);
        delivery.setStatus(status);

        if (status == DeliveryStatus.DELIVERED_TO_CUSTOMER) {
            delivery.setDeliveredAt(LocalDateTime.now());

            // Update order status
            Order order = delivery.getOrder();
            order.setStatus(OrderStatus.DELIVERED_TO_CUSTOMER);
            orderRepository.save(order);

            // Notify customer
            Notification customerNotif = new Notification();
            customerNotif.setMessage(
                "📦 Your order #" + order.getId() +
                " has been delivered! Enjoy your rental. " +
                "Please return the item by the agreed date.");
            customerNotif.setType(NotificationType.ITEM_DELIVERED);
            customerNotif.setUser(order.getCustomer());
            customerNotif.setIsRead(false);
            notificationRepository.save(customerNotif);

            // Notify seller
            for (OrderItem orderItem : order.getItems()) {
                if (orderItem.getItem() != null &&
                    orderItem.getItem().getSeller() != null) {
                    Notification sellerNotif = new Notification();
                    sellerNotif.setMessage(
                        "✅ Your item \"" + orderItem.getItem().getTitle() +
                        "\" (Order #" + order.getId() +
                        ") has been delivered to the customer!");
                    sellerNotif.setType(NotificationType.ITEM_DELIVERED);
                    sellerNotif.setUser(orderItem.getItem().getSeller());
                    sellerNotif.setIsRead(false);
                    notificationRepository.save(sellerNotif);
                }
            }

            // Notify delivery partner — payment coming
            Notification partnerNotif = new Notification();
            partnerNotif.setMessage(
                "💰 Delivery #" + id + " completed! " +
                "Your earnings will be credited within 24 hours.");
            partnerNotif.setType(NotificationType.GENERAL);
            partnerNotif.setUser(delivery.getDeliveryPartner());
            partnerNotif.setIsRead(false);
            notificationRepository.save(partnerNotif);
        }

        if (status == DeliveryStatus.PICKED_UP_FROM_SELLER) {
            // Notify customer item is on the way
            Order order = delivery.getOrder();
            Notification notif = new Notification();
            notif.setMessage(
                "🚚 Your order #" + order.getId() +
                " has been picked up from the seller and is on its way to you!");
            notif.setType(NotificationType.GENERAL);
            notif.setUser(order.getCustomer());
            notif.setIsRead(false);
            notificationRepository.save(notif);

            // Update order status
            order.setStatus(OrderStatus.PICKED_UP_FROM_SELLER);
            orderRepository.save(order);
        }

        return deliveryRequestRepository.save(delivery);
    }

    @Override
    public DeliveryRequest addVerificationVideo(Long id, String videoUrl) {
        DeliveryRequest delivery = findDeliveryById(id);
        delivery.setVerificationVideoUrl(videoUrl);
        return deliveryRequestRepository.save(delivery);
    }

    @Override
    public void deleteDelivery(Long id) {
        deliveryRequestRepository.delete(findDeliveryById(id));
    }

    @Override
    public PickupRequest createPickup(PickupRequest req) {
        Order order = orderRepository.findById(req.getOrder().getId())
                .orElseThrow(() -> new BorrowBayException("Order not found"));
        User partner = userRepository.findById(req.getDeliveryPartner().getId())
                .orElseThrow(() -> new BorrowBayException("Delivery partner not found"));
        Address pickup = addressRepository.findById(req.getPickupAddress().getId())
                .orElseThrow(() -> new BorrowBayException("Pickup address not found"));
        Address drop = addressRepository.findById(req.getDropAddress().getId())
                .orElseThrow(() -> new BorrowBayException("Drop address not found"));

        PickupRequest pickupRequest = new PickupRequest();
        pickupRequest.setOrder(order);
        pickupRequest.setDeliveryPartner(partner);
        pickupRequest.setPickupAddress(pickup);
        pickupRequest.setDropAddress(drop);
        pickupRequest.setStatus(DeliveryStatus.ASSIGNED);
        pickupRequest.setDamageFound(false);
        pickupRequest.setAssignedAt(LocalDateTime.now());
        return pickupRequestRepository.save(pickupRequest);
    }

    @Override
    public PickupRequest findPickupById(Long id) {
        return pickupRequestRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Pickup not found with id " + id));
    }

    @Override
    public List<PickupRequest> findAllPickups() {
        return pickupRequestRepository.findAll();
    }

    @Override
    public List<PickupRequest> findPickupsByPartner(Long partnerId) {
        // partnerId here is PROFILE id — get user id first
        DeliveryPartnerProfile profile = deliveryPartnerProfileRepository
                .findById(partnerId)
                .orElseThrow(() -> new BorrowBayException("Partner not found"));
        return pickupRequestRepository
                .findByDeliveryPartnerId(profile.getUser().getId());
    }

    @Override
    @Transactional
    public PickupRequest updatePickupStatus(Long id, DeliveryStatus status) {
        PickupRequest pickup = findPickupById(id);
        pickup.setStatus(status);

        if (status == DeliveryStatus.RETURNED_TO_SELLER) {
            pickup.setReturnedAt(LocalDateTime.now());

            // Update order status to COMPLETED
            Order order = pickup.getOrder();
            order.setStatus(OrderStatus.COMPLETED);
            orderRepository.save(order);

            // Notify customer
            Notification customerNotif = new Notification();
            customerNotif.setMessage(
                "✅ Order #" + order.getId() +
                " completed! Item returned to seller. " +
                "Your deposit will be refunded within 5-7 business days.");
            customerNotif.setType(NotificationType.REFUND_PROCESSED);
            customerNotif.setUser(order.getCustomer());
            customerNotif.setIsRead(false);
            notificationRepository.save(customerNotif);

            // Notify seller — order complete, earnings coming
            for (OrderItem orderItem : order.getItems()) {
                if (orderItem.getItem() != null &&
                    orderItem.getItem().getSeller() != null) {
                    Notification sellerNotif = new Notification();
                    sellerNotif.setMessage(
                        "💰 Order #" + order.getId() +
                        " completed! Your item \"" +
                        orderItem.getItem().getTitle() +
                        "\" has been returned. Earnings will be credited soon.");
                    sellerNotif.setType(NotificationType.REFUND_PROCESSED);
                    sellerNotif.setUser(orderItem.getItem().getSeller());
                    sellerNotif.setIsRead(false);
                    notificationRepository.save(sellerNotif);
                }
            }
        }

        return pickupRequestRepository.save(pickup);
    }

    @Override
    public PickupRequest reportDamage(Long id, Boolean damageFound, String notes) {
        PickupRequest pickup = findPickupById(id);
        pickup.setDamageFound(damageFound);
        pickup.setDamageNotes(notes);
        return pickupRequestRepository.save(pickup);
    }

    @Override
    public List<PickupRequest> findDamagedReturns() {
        return pickupRequestRepository.findByDamageFoundTrue();
    }

    @Override
    public List<Order> findUnassignedConfirmedOrders(String city) {
        List<Order> confirmedOrders = orderRepository
                .findByStatusAndDeliveryAddressCityIgnoreCase(
                    OrderStatus.CONFIRMED, city);
        return confirmedOrders.stream()
                .filter(order ->
                    !deliveryRequestRepository.existsByOrderId(order.getId()))
                .toList();
    }

    @Override
    @Transactional
    public DeliveryRequest acceptDeliveryJob(Long orderId, Long deliveryPartnerId) {
        if (deliveryRequestRepository.existsByOrderId(orderId)) {
            throw new BorrowBayException("This job has already been taken");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new BorrowBayException("Order not found"));

        DeliveryPartnerProfile partner = deliveryPartnerProfileRepository
                .findById(deliveryPartnerId)
                .orElseThrow(() -> new BorrowBayException("Partner not found"));

        SellerProfile sellerProfile = sellerProfileRepository
                .findByUserId(order.getItems().get(0).getItem().getSeller().getId())
                .orElseThrow(() -> new BorrowBayException("Seller profile not found"));

        DeliveryRequest delivery = new DeliveryRequest();
        delivery.setOrder(order);
        delivery.setDeliveryPartner(partner.getUser());
        delivery.setPickupAddress(sellerProfile.getPickupAddress());
        delivery.setDropAddress(order.getDeliveryAddress());
        delivery.setStatus(DeliveryStatus.ASSIGNED);
        delivery.setAssignedAt(LocalDateTime.now());

        DeliveryRequest saved = deliveryRequestRepository.save(delivery);

        // Notify customer
        Notification customerNotif = new Notification();
        customerNotif.setMessage(
            "🚚 Your order #" + order.getId() +
            " has been assigned to a delivery partner! " +
            "You'll be notified when your item is on the way.");
        customerNotif.setType(NotificationType.DELIVERY_ASSIGNED);
        customerNotif.setUser(order.getCustomer());
        customerNotif.setIsRead(false);
        notificationRepository.save(customerNotif);

        // Notify delivery partner with seller details
        String sellerInfo = "Seller: " +
            order.getItems().get(0).getItem().getSeller().getFirstName() +
            " | Phone: " +
            order.getItems().get(0).getItem().getSeller().getPhoneNumber();

        String pickupInfo = sellerProfile.getPickupAddress() != null
            ? " | Pickup: " + sellerProfile.getPickupAddress().getStreet() +
              ", " + sellerProfile.getPickupAddress().getCity()
            : " | Contact seller for pickup address";

        Notification partnerNotif = new Notification();
        partnerNotif.setMessage(
            "✅ Job accepted! Order #" + order.getId() +
            ". " + sellerInfo + pickupInfo +
            " | Drop to: " + order.getDeliveryAddress().getCity());
        partnerNotif.setType(NotificationType.DELIVERY_ASSIGNED);
        partnerNotif.setUser(partner.getUser());
        partnerNotif.setIsRead(false);
        notificationRepository.save(partnerNotif);

        return saved;
    }
}