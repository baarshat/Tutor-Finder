package com.tutor_finder.tutorfinder.controller;

import com.tutor_finder.tutorfinder.model.Notification;
import com.tutor_finder.tutorfinder.model.User;
import com.tutor_finder.tutorfinder.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/unread")
    public ResponseEntity<List<Map<String, Object>>> getUnreadNotifications(@AuthenticationPrincipal User user) {
        if (user == null) {
            throw new AccessDeniedException("User not authenticated");
        }
        List<Notification> notifications = notificationService.getUnread(user);
        List<Map<String, Object>> response = notifications.stream()
                .map(this::toNotificationResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markNotificationRead(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        if (user == null) {
            throw new AccessDeniedException("User not authenticated");
        }
        Notification notification = notificationService.markRead(user, id);
        return ResponseEntity.ok(toNotificationResponse(notification));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllRead(@AuthenticationPrincipal User user) {
        if (user == null) {
            throw new AccessDeniedException("User not authenticated");
        }
        int count = notificationService.markAllRead(user);
        return ResponseEntity.ok(Map.of("updated", count));
    }

    private Map<String, Object> toNotificationResponse(Notification notification) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", notification.getId());
        response.put("message", notification.getMessage());
        response.put("type", notification.getType());
        response.put("read", notification.isRead());
        response.put("createdAt", notification.getCreatedAt());
        return response;
    }
}
