package com.borrowbay.service;

import java.util.List;
import com.borrowbay.model.SearchQueryLog;

public interface SearchQueryLogService {
    SearchQueryLog logSearch(String query, Long userId);
    List<SearchQueryLog> findByUserId(Long userId);
    List<SearchQueryLog> findAll();
}