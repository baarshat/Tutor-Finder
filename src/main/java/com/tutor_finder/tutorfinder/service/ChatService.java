package com.tutor_finder.tutorfinder.service;

import com.tutor_finder.tutorfinder.dto.ChatMessageDTO;
import com.tutor_finder.tutorfinder.dto.ConversationDTO;
import com.tutor_finder.tutorfinder.model.ChatMessage;
import com.tutor_finder.tutorfinder.model.User;
import com.tutor_finder.tutorfinder.repository.ChatMessageRepository;
import com.tutor_finder.tutorfinder.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    @Transactional
    public ChatMessageDTO saveMessage(ChatMessageDTO messageDTO) {
        User sender = userRepository.findById(messageDTO.getSenderId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User recipient = userRepository.findById(messageDTO.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        ChatMessage message = ChatMessage.builder()
                .sender(sender)
                .recipient(recipient)
                .content(messageDTO.getContent())
                .timestamp(LocalDateTime.now())
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);

        return toDTO(savedMessage);
    }

    public Page<ChatMessageDTO> getChatHistory(Long user1Id, Long user2Id, int page, int size) {
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(page, size);
        return chatMessageRepository.findChatHistory(user1, user2, pageable)
                .map(this::toDTO);
    }

    public List<ConversationDTO> getConversations(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<User> partners = chatMessageRepository.findConversationPartners(user);

        return partners.stream().map(partner -> {
            List<ChatMessage> latestList = chatMessageRepository.findLatestMessages(user, partner, PageRequest.of(0, 1));
            ChatMessage latest = latestList.isEmpty() ? null : latestList.get(0);
            return ConversationDTO.builder()
                    .userId(partner.getId())
                    .userName(partner.getName())
                    .profilePicUrl(partner.getProfilePicUrl())
                    .lastMessage(latest != null ? latest.getContent() : "")
                    .lastMessageTime(latest != null ? latest.getTimestamp() : null)
                    .build();
        })
        .sorted(Comparator.comparing(ConversationDTO::getLastMessageTime,
                Comparator.nullsLast(Comparator.reverseOrder())))
        .collect(Collectors.toList());
    }

    private ChatMessageDTO toDTO(ChatMessage message) {
        return ChatMessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .recipientId(message.getRecipient().getId())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .build();
    }
}
