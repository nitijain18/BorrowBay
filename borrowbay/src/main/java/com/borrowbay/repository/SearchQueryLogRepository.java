package com.borrowbay.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.borrowbay.model.SearchQueryLog;

public interface SearchQueryLogRepository extends JpaRepository<SearchQueryLog, Long> {
    List<SearchQueryLog> findByUserId(Long userId);
    List<SearchQueryLog> findByQueryContainingIgnoreCase(String keyword);
}