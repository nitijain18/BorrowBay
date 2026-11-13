package com.borrowbay.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.borrowbay.exception.BorrowBayException;
import com.borrowbay.model.*;
import com.borrowbay.repository.*;
import com.borrowbay.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public Notification createNotification(Notification req) {
        if (req.getUser() == null || req.getUser().getId() == null)
            throw new BorrowBayException("User id is required");
        User user = userRepository.findById(req.getUser().getId())
                .orElseThrow(() -> new BorrowBayException("User not found"));

        Notification notification = new Notification();
        notification.setMessage(req.getMessage());
        notification.setType(req.getType());
        notification.setIsRead(false);
        notification.setUser(user);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> findByUserId(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    @Override
    public List<Notification> findUnreadByUserId(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    @Override
    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Notification not found with id " + id));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new BorrowBayException("Notification not found with id " + id));
        notificationRepository.delete(notification);
    }

    @Override
    public void clearAllNotifications(Long userId) {
        notificationRepository.deleteByUserId(userId);
    }
}