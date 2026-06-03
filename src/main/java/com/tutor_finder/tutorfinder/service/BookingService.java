package com.tutor_finder.tutorfinder.service;

import com.tutor_finder.tutorfinder.dto.AvailabilityDateSlots;
import com.tutor_finder.tutorfinder.dto.BookingRequest;
import com.tutor_finder.tutorfinder.model.*;
import com.tutor_finder.tutorfinder.repository.BookingRepository;
import com.tutor_finder.tutorfinder.repository.StudentProfileRepository;
import com.tutor_finder.tutorfinder.repository.TutorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    private final BookingRepository bookingRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AvailabilityService availabilityService;
    private final NotificationService notificationService;

    public Booking createBooking(User student, BookingRequest request) {
        if (student == null) {
            throw new AccessDeniedException("User not authenticated");
        }
        if (student.getRole() != Role.STUDENT) {
            throw new AccessDeniedException("Only students can create bookings");
        }
        if (request.getTutorProfileId() == null) {
            throw new IllegalArgumentException("Tutor profile is required");
        }
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Start and end times are required");
        }

        TutorProfile tutorProfile = tutorProfileRepository.findById(request.getTutorProfileId())
                .orElseThrow(() -> new NoSuchElementException("Tutor profile not found"));

        StudentProfile studentProfile = studentProfileRepository.findByUserId(student.getId())
                .orElseGet(() -> {
                    StudentProfile profile = new StudentProfile();
                    profile.setUser(student);
                    return studentProfileRepository.save(profile);
                });

        LocalDateTime startTime = LocalDateTime.parse(request.getStartTime());
        LocalDateTime endTime = LocalDateTime.parse(request.getEndTime());

        if (!endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }

        int durationMinutes = (int) Duration.between(startTime, endTime).toMinutes();
        List<AvailabilityDateSlots> availableDates = availabilityService.getAvailabilitySlots(tutorProfile.getId(), durationMinutes);
        String targetDate = startTime.toLocalDate().toString();
        boolean slotAvailable = availableDates.stream()
                .filter(date -> date.getDate().equals(targetDate))
                .flatMap(date -> date.getSlots().stream())
                .anyMatch(slot -> slot.equals(startTime.toLocalTime().format(TIME_FORMAT)));

        if (!slotAvailable) {
            throw new IllegalArgumentException("Selected time slot is no longer available");
        }

        String studentName = request.getStudentName() == null || request.getStudentName().isBlank()
                ? student.getName()
                : request.getStudentName();
        String studentEmail = request.getStudentEmail() == null || request.getStudentEmail().isBlank()
                ? student.getEmail()
                : request.getStudentEmail();

        Booking booking = Booking.builder()
                .tutorProfile(tutorProfile)
                .student(student)
                .studentProfile(studentProfile)
                .studentName(studentName)
                .studentEmail(studentEmail)
                .startTime(startTime)
                .endTime(endTime)
                .notes(request.getNotes())
                .status(BookingStatus.PENDING)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        String tutorMessage = String.format(
                Locale.US,
                "New booking request from %s for %s at %s.",
                studentName,
                startTime.toLocalDate(),
                startTime.toLocalTime().format(TIME_FORMAT)
        );
        notificationService.create(tutorProfile.getUser(), tutorMessage, NotificationType.BOOKING_REQUEST);

        String studentMessage = String.format(
                Locale.US,
                "Your booking request with %s is submitted for %s at %s.",
                tutorProfile.getUser().getName(),
                startTime.toLocalDate(),
                startTime.toLocalTime().format(TIME_FORMAT)
        );
        notificationService.create(student, studentMessage, NotificationType.BOOKING_REQUEST);

        return savedBooking;
    }

    public List<Booking> getBookingsForUser(User user, String type) {
        if (user == null) {
            throw new AccessDeniedException("User not authenticated");
        }

        LocalDateTime now = LocalDateTime.now();
        boolean upcoming = "upcoming".equalsIgnoreCase(type);

        List<Booking> bookings;
        if (user.getRole() == Role.TUTOR) {
            TutorProfile tutorProfile = tutorProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new NoSuchElementException("Tutor profile not found"));
            bookings = bookingRepository.findByTutorProfileIdAndStatusNot(tutorProfile.getId(), BookingStatus.CANCELLED);
        } else {
            bookings = bookingRepository.findByStudentIdAndStatusNot(user.getId(), BookingStatus.CANCELLED);
        }

        return bookings.stream()
                .filter(booking -> upcoming ? !booking.getStartTime().isBefore(now) : booking.getStartTime().isBefore(now))
                .sorted(upcoming
                        ? Comparator.comparing(Booking::getStartTime)
                        : Comparator.comparing(Booking::getStartTime).reversed())
                .toList();
    }

    public Booking cancelBooking(User user, Long bookingId) {
        if (user == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        boolean isTutorOwner = booking.getTutorProfile().getUser().getId().equals(user.getId());
        boolean isStudentOwner = booking.getStudent().getId().equals(user.getId());

        if (!isTutorOwner && !isStudentOwner) {
            throw new AccessDeniedException("Not authorized to cancel this booking");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking savedBooking = bookingRepository.save(booking);

        String tutorMessage = String.format(
                Locale.US,
                "Booking for %s at %s was cancelled.",
                booking.getStartTime().toLocalDate(),
                booking.getStartTime().toLocalTime().format(TIME_FORMAT)
        );
        notificationService.create(booking.getTutorProfile().getUser(), tutorMessage, NotificationType.BOOKING_CANCELLED);

        String studentMessage = String.format(
                Locale.US,
                "Your booking for %s at %s was cancelled.",
                booking.getStartTime().toLocalDate(),
                booking.getStartTime().toLocalTime().format(TIME_FORMAT)
        );
        notificationService.create(booking.getStudent(), studentMessage, NotificationType.BOOKING_CANCELLED);

        return savedBooking;
    }
}
