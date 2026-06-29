package com.tutor_finder.tutorfinder.controller;

import com.tutor_finder.tutorfinder.dto.ChatMessageDTO;
import com.tutor_finder.tutorfinder.dto.ConversationDTO;
import com.tutor_finder.tutorfinder.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/history/{user1Id}/{user2Id}")
    public Page<ChatMessageDTO> getChatHistory(
            @PathVariable Long user1Id,
            @PathVariable Long user2Id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return chatService.getChatHistory(user1Id, user2Id, page, size);
    }

    @GetMapping("/conversations/{userId}")
    public List<ConversationDTO> getConversations(@PathVariable Long userId) {
        return chatService.getConversations(userId);
    }

    @PostMapping("/send")
    public ChatMessageDTO sendMessage(@RequestBody ChatMessageDTO messageDTO) {
        return chatService.saveMessage(messageDTO);
    }
}
