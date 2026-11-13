package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.model.SupportTicket;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.SupportTicketService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/support-tickets")
@RequiredArgsConstructor
public class SupportTicketController {

    private final SupportTicketService supportTicketService;

    @PostMapping
    public ResponseEntity<SupportTicket> createTicket(@RequestBody SupportTicket req) {
        return ResponseEntity.ok(supportTicketService.createTicket(req));
    }

    @GetMapping
    public ResponseEntity<List<SupportTicket>> getAllTickets() {
        return ResponseEntity.ok(supportTicketService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupportTicket> getTicketById(@PathVariable Long id) {
        return ResponseEntity.ok(supportTicketService.findById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SupportTicket>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(supportTicketService.findByUserId(userId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<SupportTicket>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(supportTicketService.findByStatus(status));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<SupportTicket> resolveTicket(@PathVariable Long id,
                                                        @RequestParam String resolution) {
        return ResponseEntity.ok(supportTicketService.resolveTicket(id, resolution));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteTicket(@PathVariable Long id) {
        supportTicketService.deleteTicket(id);
        return ResponseEntity.ok(new ApiResponse("Ticket deleted successfully", true));
    }
}