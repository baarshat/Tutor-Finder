package com.tutor_finder.tutorfinder.dto;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long bookingId;
    private Integer rating; // 1 to 5
    private String comment;
}
