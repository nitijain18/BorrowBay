package com.borrowbay.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.model.RentalHistory;
import com.borrowbay.repository.RentalHistoryRepository;
import com.borrowbay.service.RentalHistoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RentalHistoryServiceImpl implements RentalHistoryService {

    private final RentalHistoryRepository rentalHistoryRepository;

    @Override
    public List<RentalHistory> findByCustomerId(Long customerId) {
        return rentalHistoryRepository.findByCustomerId(customerId);
    }

    @Override
    public List<RentalHistory> findByItemId(Long itemId) {
        return rentalHistoryRepository.findByItemId(itemId);
    }

    @Override
    public List<RentalHistory> findAll() {
        return rentalHistoryRepository.findAll();
    }
}