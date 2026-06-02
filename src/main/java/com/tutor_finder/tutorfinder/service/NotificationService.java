package com.tutor_finder.tutorfinder.service;

import com.tutor_finder.tutorfinder.model.Notification;
import com.tutor_finder.tutorfinder.model.NotificationType;
import com.tutor_finder.tutorfinder.model.User;
import com.tutor_finder.tutorfinder.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public Notification create(User user, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type == null ? NotificationType.GENERAL : type)
                .build();
        return notificationRepository.save(notification);
    }

    public List<Notification> getUnread(User user) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(user.getId());
    }

    public Notification markRead(User user, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Not authorized to update this notification");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public int markAllRead(User user) {
        List<Notification> notifications = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(user.getId());
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
        return notifications.size();
    }
}
