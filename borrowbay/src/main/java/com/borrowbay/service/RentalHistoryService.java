package com.borrowbay.service;

import java.util.List;
import com.borrowbay.model.RentalHistory;

public interface RentalHistoryService {
    List<RentalHistory> findByCustomerId(Long customerId);
    List<RentalHistory> findByItemId(Long itemId);
    List<RentalHistory> findAll();
}