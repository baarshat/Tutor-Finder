package com.tutor_finder.tutorfinder.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityDateSlots {
    private String date;
    private List<String> slots;
}
