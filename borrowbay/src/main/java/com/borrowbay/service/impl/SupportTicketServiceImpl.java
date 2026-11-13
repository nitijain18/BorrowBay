package com.borrowbay.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.service.SupportTicketService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SupportTicketServiceImpl implements SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @Override
    public SupportTicket createTicket(SupportTicket req) {
        User raisedBy = userRepository.findById(req.getRaisedBy().getId())
                .orElseThrow(() -> new BorrowBayException("User not found"));

        SupportTicket ticket = new SupportTicket();
        ticket.setSubject(req.getSubject());
        ticket.setDescription(req.getDescription());
        ticket.setStatus("OPEN");
        ticket.setRaisedBy(raisedBy);
        ticket.setCreatedAt(LocalDateTime.now());

        if (req.getOrder() != null && req.getOrder().getId() != null) {
            Order order = orderRepository.findById(req.getOrder().getId())
                    .orElseThrow(() -> new BorrowBayException("Order not found"));
            ticket.setOrder(order);
        }
        return supportTicketRepository.save(ticket);
    }

    @Override
    public SupportTicket findById(Long id) {
        return supportTicketRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Ticket not found with id " + id));
    }

    @Override
    public List<SupportTicket> findAll() {
        return supportTicketRepository.findAll();
    }

    @Override
    public List<SupportTicket> findByUserId(Long userId) {
        return supportTicketRepository.findByRaisedById(userId);
    }

    @Override
    public List<SupportTicket> findByStatus(String status) {
        return supportTicketRepository.findByStatus(status);
    }

    @Override
    public SupportTicket resolveTicket(Long id, String resolution) {
        SupportTicket ticket = findById(id);
        ticket.setStatus("RESOLVED");
        ticket.setResolution(resolution);
        ticket.setResolvedAt(LocalDateTime.now());
        return supportTicketRepository.save(ticket);
    }

    @Override
    public void deleteTicket(Long id) {
        supportTicketRepository.delete(findById(id));
    }
}