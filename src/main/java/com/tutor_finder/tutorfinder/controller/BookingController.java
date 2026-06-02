package com.tutor_finder.tutorfinder.controller;

import com.tutor_finder.tutorfinder.dto.AvailabilityDateSlots;
import com.tutor_finder.tutorfinder.dto.AvailabilityRequest;
import com.tutor_finder.tutorfinder.dto.BookingRequest;
import com.tutor_finder.tutorfinder.model.Booking;
import com.tutor_finder.tutorfinder.model.User;
import com.tutor_finder.tutorfinder.service.AvailabilityService;
import com.tutor_finder.tutorfinder.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final AvailabilityService availabilityService;

    @GetMapping("/availability")
    public ResponseEntity<List<AvailabilityDateSlots>> getAvailability(
            @RequestParam Long tutorProfileId,
            @RequestParam(defaultValue = "60") int durationMinutes) {
        if (durationMinutes <= 0) {
            throw new IllegalArgumentException("Duration must be positive");
        }
        return ResponseEntity.ok(availabilityService.getAvailabilitySlots(tutorProfileId, durationMinutes));
    }

    @GetMapping("/tutor/availability")
    public ResponseEntity<Map<String, Object>> getTutorAvailability(@AuthenticationPrincipal User user) {
        if (user == null) {
            throw new AccessDeniedException("User not authenticated");
        }
        return ResponseEntity.ok(availabilityService.getAvailabilityForTutor(user));
    }

    @PutMapping("/tutor/availability")
    public ResponseEntity<Map<String, Object>> updateTutorAvailability(
            @AuthenticationPrincipal User user,
            @RequestBody AvailabilityRequest request) {
        if (user == null) {
            throw new AccessDeniedException("User not authenticated");
        }
        return ResponseEntity.ok(availabilityService.updateAvailability(user, request));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(
            @AuthenticationPrincipal User user,
            @RequestBody BookingRequest request) {
        if (user == null) {
            throw new AccessDeniedException("User not authenticated");
        }
        Booking booking = bookingService.createBooking(user, request);
        return ResponseEntity.ok(toBookingResponse(booking));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getBookings(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "upcoming") String type) {
        if (user == null) {
            throw new AccessDeniedException("User not authenticated");
        }
        List<Booking> bookings = bookingService.getBookingsForUser(user, type);
        return ResponseEntity.ok(bookings.stream().map(this::toBookingResponse).toList());
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelBooking(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        if (user == null) {
            throw new AccessDeniedException("User not authenticated");
        }
        Booking booking = bookingService.cancelBooking(user, id);
        return ResponseEntity.ok(toBookingResponse(booking));
    }

    private Map<String, Object> toBookingResponse(Booking booking) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", booking.getId());
        response.put("startTime", booking.getStartTime());
        response.put("endTime", booking.getEndTime());
        response.put("status", booking.getStatus());
        response.put("notes", booking.getNotes());

        Map<String, Object> tutor = new HashMap<>();
        tutor.put("id", booking.getTutorProfile().getId());
        if (booking.getTutorProfile().getUser() != null) {
            tutor.put("name", booking.getTutorProfile().getUser().getName());
            tutor.put("email", booking.getTutorProfile().getUser().getEmail());
        }
        response.put("tutor", tutor);

        Map<String, Object> student = new HashMap<>();
        student.put("id", booking.getStudent().getId());
        student.put("name", booking.getStudentName());
        student.put("email", booking.getStudentEmail());
        response.put("student", student);

        return response;
    }
}
