package com.borrowbay.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.SupportTicket;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByRaisedById(Long userId);
    List<SupportTicket> findByStatus(String status);
    List<SupportTicket> findByOrderId(Long orderId);
}