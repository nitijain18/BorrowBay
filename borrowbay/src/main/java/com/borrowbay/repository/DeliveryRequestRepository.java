package com.borrowbay.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.DeliveryRequest;
import com.borrowbay.domain.DeliveryStatus;

public interface DeliveryRequestRepository extends JpaRepository<DeliveryRequest, Long> {
    Optional<DeliveryRequest> findByOrderId(Long orderId);
    List<DeliveryRequest> findByDeliveryPartnerId(Long partnerId);
    List<DeliveryRequest> findByStatus(DeliveryStatus status);
    List<DeliveryRequest> findByDeliveryPartnerIdAndStatus(Long partnerId, DeliveryStatus status);
    boolean existsByOrderId(Long orderId);
}