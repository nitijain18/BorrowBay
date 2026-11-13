package com.borrowbay.service;

import java.util.List;
import com.borrowbay.model.SupportTicket;

public interface SupportTicketService {
    SupportTicket createTicket(SupportTicket req);
    SupportTicket findById(Long id);
    List<SupportTicket> findAll();
    List<SupportTicket> findByUserId(Long userId);
    List<SupportTicket> findByStatus(String status);
    SupportTicket resolveTicket(Long id, String resolution);
    void deleteTicket(Long id);
}