package com.tutor_finder.tutorfinder.dto;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
public class AvailabilityRequest {
    private Integer timeGap = 0;
    private Map<String, AvailabilityDayRequest> days = new HashMap<>();

    @JsonAnySetter
    public void addDay(String key, AvailabilityDayRequest value) {
        if (!"timeGap".equalsIgnoreCase(key)) {
            days.put(key, value);
        }
    }
}
