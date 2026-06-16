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
public class ReviewResponse {
    private Long id;
    private Long bookingId;
    private Integer rating;
    private String comment;
    private String studentName;
    private LocalDateTime createdAt;
    private Long tutorProfileId;
    private Long studentId;
}
