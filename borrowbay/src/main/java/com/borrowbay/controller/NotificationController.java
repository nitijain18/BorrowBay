package com.borrowbay.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.borrowbay.model.Notification;
import com.borrowbay.response.ApiResponse;
import com.borrowbay.service.NotificationService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification req) {
        return ResponseEntity.ok(notificationService.createNotification(req));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.findByUserId(userId));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnread(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.findUnreadByUserId(userId));
    }

    @PatchMapping("/{id}/mark-read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(new ApiResponse("Notification deleted successfully", true));
    }

    @DeleteMapping("/user/{userId}/clear")
    public ResponseEntity<ApiResponse> clearAll(@PathVariable Long userId) {
        notificationService.clearAllNotifications(userId);
        return ResponseEntity.ok(new ApiResponse("All notifications cleared", true));
    }
}