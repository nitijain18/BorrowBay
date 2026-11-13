package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.model.SearchQueryLog;
import com.borrowbay.service.SearchQueryLogService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/search-logs")
@RequiredArgsConstructor
public class SearchQueryLogController {

    private final SearchQueryLogService searchQueryLogService;

    @PostMapping
    public ResponseEntity<SearchQueryLog> logSearch(@RequestParam String query,
                                                     @RequestParam Long userId) {
        return ResponseEntity.ok(searchQueryLogService.logSearch(query, userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SearchQueryLog>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(searchQueryLogService.findByUserId(userId));
    }

    @GetMapping
    public ResponseEntity<List<SearchQueryLog>> getAllLogs() {
        return ResponseEntity.ok(searchQueryLogService.findAll());
    }
}