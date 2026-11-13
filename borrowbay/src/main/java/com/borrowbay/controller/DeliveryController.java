package com.borrowbay.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.borrowbay.domain.DeliveryStatus;
import com.borrowbay.model.DeliveryRequest;
import com.borrowbay.model.Order;
import com.borrowbay.model.PickupRequest;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.DeliveryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/deliveries")
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    @PostMapping
    public ResponseEntity<DeliveryRequest> createDelivery(@RequestBody DeliveryRequest req) {
        return ResponseEntity.ok(deliveryService.createDelivery(req));
    }

    @GetMapping
    public ResponseEntity<List<DeliveryRequest>> getAllDeliveries() {
        return ResponseEntity.ok(deliveryService.findAllDeliveries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryRequest> getDeliveryById(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.findDeliveryById(id));
    }

    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<List<DeliveryRequest>> getDeliveriesByPartner(
            @PathVariable Long partnerId) {
        return ResponseEntity.ok(deliveryService.findDeliveriesByPartner(partnerId));
    }

    @GetMapping("/pickup/partner/{partnerId}")
    public ResponseEntity<List<PickupRequest>> getPickupsByPartner(
            @PathVariable Long partnerId) {
        return ResponseEntity.ok(deliveryService.findPickupsByPartner(partnerId));
    }

    @GetMapping("/available-jobs")
    public ResponseEntity<List<Order>> getAvailableJobs(@RequestParam String city) {
        return ResponseEntity.ok(deliveryService.findUnassignedConfirmedOrders(city));
    }

    @PostMapping("/accept-job/{orderId}")
    public ResponseEntity<DeliveryRequest> acceptJob(
            @PathVariable Long orderId,
            @RequestParam Long deliveryPartnerId) {
        return ResponseEntity.ok(
            deliveryService.acceptDeliveryJob(orderId, deliveryPartnerId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DeliveryRequest> updateDeliveryStatus(
            @PathVariable Long id,
            @RequestParam DeliveryStatus status) {
        return ResponseEntity.ok(deliveryService.updateDeliveryStatus(id, status));
    }

    @PatchMapping("/{id}/verification-video")
    public ResponseEntity<DeliveryRequest> addVerificationVideo(
            @PathVariable Long id,
            @RequestParam String videoUrl) {
        return ResponseEntity.ok(deliveryService.addVerificationVideo(id, videoUrl));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteDelivery(@PathVariable Long id) {
        deliveryService.deleteDelivery(id);
        return ResponseEntity.ok(new ApiResponse("Delivery deleted successfully", true));
    }

    @PostMapping("/pickup")
    public ResponseEntity<PickupRequest> createPickup(@RequestBody PickupRequest req) {
        return ResponseEntity.ok(deliveryService.createPickup(req));
    }

    @GetMapping("/pickup")
    public ResponseEntity<List<PickupRequest>> getAllPickups() {
        return ResponseEntity.ok(deliveryService.findAllPickups());
    }

    @GetMapping("/pickup/{id}")
    public ResponseEntity<PickupRequest> getPickupById(@PathVariable Long id) {
        return ResponseEntity.ok(deliveryService.findPickupById(id));
    }

    @PatchMapping("/pickup/{id}/status")
    public ResponseEntity<PickupRequest> updatePickupStatus(
            @PathVariable Long id,
            @RequestParam DeliveryStatus status) {
        return ResponseEntity.ok(deliveryService.updatePickupStatus(id, status));
    }

    @PatchMapping("/pickup/{id}/damage")
    public ResponseEntity<PickupRequest> reportDamage(
            @PathVariable Long id,
            @RequestParam Boolean damageFound,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(deliveryService.reportDamage(id, damageFound, notes));
    }

    @GetMapping("/pickup/damaged")
    public ResponseEntity<List<PickupRequest>> getDamagedReturns() {
        return ResponseEntity.ok(deliveryService.findDamagedReturns());
    }
}