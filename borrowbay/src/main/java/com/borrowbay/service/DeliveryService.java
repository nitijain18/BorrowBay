package com.borrowbay.service;

import java.util.List;
import com.borrowbay.domain.DeliveryStatus;
import com.borrowbay.model.DeliveryRequest;
import com.borrowbay.model.Order;
import com.borrowbay.model.PickupRequest;

public interface DeliveryService {
    DeliveryRequest createDelivery(DeliveryRequest req);
    DeliveryRequest findDeliveryById(Long id);
    List<DeliveryRequest> findAllDeliveries();
    List<DeliveryRequest> findDeliveriesByPartner(Long partnerId);
    DeliveryRequest updateDeliveryStatus(Long id, DeliveryStatus status);
    DeliveryRequest addVerificationVideo(Long id, String videoUrl);
    void deleteDelivery(Long id);
    List<Order> findUnassignedConfirmedOrders(String city);
    DeliveryRequest acceptDeliveryJob(Long orderId, Long deliveryPartnerId);

    PickupRequest createPickup(PickupRequest req);
    PickupRequest findPickupById(Long id);
    List<PickupRequest> findAllPickups();
    List<PickupRequest> findPickupsByPartner(Long partnerId);
    PickupRequest updatePickupStatus(Long id, DeliveryStatus status);
    PickupRequest reportDamage(Long id, Boolean damageFound, String notes);
    List<PickupRequest> findDamagedReturns();
}