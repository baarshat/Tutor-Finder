package com.tutor_finder.tutorfinder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private Long userId;
    private String userName;
    private String profilePicUrl;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
}
