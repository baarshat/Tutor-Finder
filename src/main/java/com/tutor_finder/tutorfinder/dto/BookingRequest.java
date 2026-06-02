package com.tutor_finder.tutorfinder.dto;

import lombok.Data;

@Data
public class BookingRequest {
    private Long tutorProfileId;
    private String studentName;
    private String studentEmail;
    private String startTime;
    private String endTime;
    private String notes;
}
