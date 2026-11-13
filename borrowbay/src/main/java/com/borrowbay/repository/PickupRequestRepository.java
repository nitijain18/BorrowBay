package com.borrowbay.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.PickupRequest;
import com.borrowbay.domain.DeliveryStatus;

public interface PickupRequestRepository extends JpaRepository<PickupRequest, Long> {
    Optional<PickupRequest> findByOrderId(Long orderId);
    List<PickupRequest> findByDeliveryPartnerId(Long partnerId);
    List<PickupRequest> findByStatus(DeliveryStatus status);
    List<PickupRequest> findByDamageFoundTrue();
}