package com.tutor_finder.tutorfinder.controller;

import com.tutor_finder.tutorfinder.dto.ChatMessageDTO;
import com.tutor_finder.tutorfinder.service.ChatService;
import com.tutor_finder.tutorfinder.repository.UserRepository;
import com.tutor_finder.tutorfinder.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final UserRepository userRepository;

    @MessageMapping("/chat.send")
    public void sendMessage(ChatMessageDTO message) {
        ChatMessageDTO savedMessage = chatService.saveMessage(message);
        
        // Retrieve sender and recipient to get their emails (used as WebSocket Security Principals)
        User recipient = userRepository.findById(savedMessage.getRecipientId()).orElse(null);
        User sender = userRepository.findById(savedMessage.getSenderId()).orElse(null);
        
        if (recipient != null) {
            messagingTemplate.convertAndSendToUser(
                    recipient.getEmail(),
                    "/queue/messages",
                    savedMessage
            );
        }
        
        if (sender != null) {
            messagingTemplate.convertAndSendToUser(
                    sender.getEmail(),
                    "/queue/messages",
                    savedMessage
            );
        }
    }
}
