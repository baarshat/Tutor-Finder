package com.tutor_finder.tutorfinder.repository;

import com.tutor_finder.tutorfinder.model.ChatMessage;
import com.tutor_finder.tutorfinder.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.sender = :user1 AND m.recipient = :user2) OR " +
           "(m.sender = :user2 AND m.recipient = :user1) " +
           "ORDER BY m.timestamp DESC")
    Page<ChatMessage> findChatHistory(@Param("user1") User user1, @Param("user2") User user2, Pageable pageable);

    @Query("SELECT DISTINCT CASE WHEN m.sender = :user THEN m.recipient ELSE m.sender END " +
           "FROM ChatMessage m WHERE m.sender = :user OR m.recipient = :user")
    List<User> findConversationPartners(@Param("user") User user);

    @Query("SELECT m FROM ChatMessage m WHERE " +
           "(m.sender = :user1 AND m.recipient = :user2) OR " +
           "(m.sender = :user2 AND m.recipient = :user1) " +
           "ORDER BY m.timestamp DESC")
    List<ChatMessage> findLatestMessages(@Param("user1") User user1, @Param("user2") User user2, Pageable pageable);
}
