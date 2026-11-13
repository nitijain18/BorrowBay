package com.borrowbay.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.service.SearchQueryLogService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SearchQueryLogServiceImpl implements SearchQueryLogService {

    private final SearchQueryLogRepository searchQueryLogRepository;
    private final UserRepository userRepository;

    @Override
    public SearchQueryLog logSearch(String query, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BorrowBayException("User not found"));
        SearchQueryLog log = new SearchQueryLog();
        log.setQuery(query);
        log.setUser(user);
        log.setSearchedAt(LocalDateTime.now());
        return searchQueryLogRepository.save(log);
    }

    @Override
    public List<SearchQueryLog> findByUserId(Long userId) {
        return searchQueryLogRepository.findByUserId(userId);
    }

    @Override
    public List<SearchQueryLog> findAll() {
        return searchQueryLogRepository.findAll();
    }
}