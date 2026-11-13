package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.domain.RefundStatus;
import com.borrowbay.model.Refund;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.RefundService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    @PostMapping
    public ResponseEntity<Refund> initiateRefund(@RequestBody Refund req) {
        return ResponseEntity.ok(refundService.initiateRefund(req));
    }

    @GetMapping
    public ResponseEntity<List<Refund>> getAllRefunds() {
        return ResponseEntity.ok(refundService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Refund> getRefundById(@PathVariable Long id) {
        return ResponseEntity.ok(refundService.findById(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Refund>> getRefundsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(refundService.findByCustomerId(customerId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Refund>> getRefundsByStatus(@PathVariable RefundStatus status) {
        return ResponseEntity.ok(refundService.findByStatus(status));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Refund> approveRefund(@PathVariable Long id) {
        return ResponseEntity.ok(refundService.approveRefund(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Refund> rejectRefund(@PathVariable Long id) {
        return ResponseEntity.ok(refundService.rejectRefund(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteRefund(@PathVariable Long id) {
        refundService.deleteRefund(id);
        return ResponseEntity.ok(new ApiResponse("Refund deleted successfully", true));
    }
}