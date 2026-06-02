package com.tutor_finder.tutorfinder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityDayRequest {
    private boolean isAvailable;
    private String startTime;
    private String endTime;
}
