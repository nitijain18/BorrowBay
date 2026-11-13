package com.borrowbay.service;

import java.util.List;
import com.borrowbay.model.Notification;

public interface NotificationService {
    Notification createNotification(Notification req);
    List<Notification> findByUserId(Long userId);
    List<Notification> findUnreadByUserId(Long userId);
    Notification markAsRead(Long id);
    void deleteNotification(Long id);
    void clearAllNotifications(Long userId);
}