package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.model.RentalHistory;
import com.borrowbay.service.RentalHistoryService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/rental-history")
@RequiredArgsConstructor
public class RentalHistoryController {

    private final RentalHistoryService rentalHistoryService;

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<RentalHistory>> getByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(rentalHistoryService.findByCustomerId(customerId));
    }

    @GetMapping("/item/{itemId}")
    public ResponseEntity<List<RentalHistory>> getByItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(rentalHistoryService.findByItemId(itemId));
    }

    @GetMapping
    public ResponseEntity<List<RentalHistory>> getAll() {
        return ResponseEntity.ok(rentalHistoryService.findAll());
    }
}