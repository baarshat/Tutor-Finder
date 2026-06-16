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

import org.springframework.scheduling.annotation.Scheduled;

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
    private final EmailService emailService;

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

        // Send Email Notifications
        String emailSubject = "New Booking Created - TutorFinder";
        String tutorEmailBody = String.format(
                "Dear %s,\n\nYou have received a new booking request from %s for %s at %s.\n\nNotes: %s\n\nBest regards,\nTutorFinder Team",
                tutorProfile.getUser().getName(),
                studentName,
                startTime.toLocalDate(),
                startTime.toLocalTime().format(TIME_FORMAT),
                request.getNotes() != null ? request.getNotes() : "N/A"
        );
        String studentEmailBody = String.format(
                "Dear %s,\n\nYour booking request with tutor %s has been submitted for %s at %s.\n\nNotes: %s\n\nBest regards,\nTutorFinder Team",
                studentName,
                tutorProfile.getUser().getName(),
                startTime.toLocalDate(),
                startTime.toLocalTime().format(TIME_FORMAT),
                request.getNotes() != null ? request.getNotes() : "N/A"
        );

        emailService.sendEmail(tutorProfile.getUser().getEmail(), emailSubject, tutorEmailBody);
        emailService.sendEmail(studentEmail, emailSubject, studentEmailBody);

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

    public Booking completeBooking(User user, Long bookingId) {
        if (user == null) {
            throw new IllegalArgumentException("User not authenticated");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        // Only the assigned tutor can mark as completed
        boolean isTutorOwner = booking.getTutorProfile().getUser().getId().equals(user.getId());
        if (!isTutorOwner) {
            throw new AccessDeniedException("Only the assigned tutor can mark this session as completed");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot complete a cancelled booking");
        }

        booking.setStatus(BookingStatus.COMPLETED);
        Booking savedBooking = bookingRepository.save(booking);

        // Notify student
        String studentMessage = String.format(
                Locale.US,
                "Your session with %s on %s has been marked as completed. You can now leave a review.",
                booking.getTutorProfile().getUser().getName(),
                booking.getStartTime().toLocalDate()
        );
        notificationService.create(booking.getStudent(), studentMessage, NotificationType.GENERAL);

        // Send Email to student
        String emailSubject = "Session Completed - TutorFinder";
        String studentEmailBody = String.format(
                "Dear %s,\n\nYour session with tutor %s on %s has been marked as completed.\n\nYou can now provide a rating and review for this session by visiting your dashboard.\n\nBest regards,\nTutorFinder Team",
                booking.getStudentName(),
                booking.getTutorProfile().getUser().getName(),
                booking.getStartTime().toLocalDate()
        );
        emailService.sendEmail(booking.getStudentEmail(), emailSubject, studentEmailBody);

        return savedBooking;
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

        // Send Email Notifications
        String emailSubject = "Booking Cancelled - TutorFinder";
        String tutorEmailBody = String.format(
                "Dear %s,\n\nThe booking with student %s for %s at %s has been cancelled.\n\nBest regards,\nTutorFinder Team",
                booking.getTutorProfile().getUser().getName(),
                booking.getStudentName(),
                booking.getStartTime().toLocalDate(),
                booking.getStartTime().toLocalTime().format(TIME_FORMAT)
        );
        String studentEmailBody = String.format(
                "Dear %s,\n\nYour booking with tutor %s for %s at %s has been cancelled.\n\nBest regards,\nTutorFinder Team",
                booking.getStudentName(),
                booking.getTutorProfile().getUser().getName(),
                booking.getStartTime().toLocalDate(),
                booking.getStartTime().toLocalTime().format(TIME_FORMAT)
        );

        emailService.sendEmail(booking.getTutorProfile().getUser().getEmail(), emailSubject, tutorEmailBody);
        emailService.sendEmail(booking.getStudentEmail(), emailSubject, studentEmailBody);

        return savedBooking;
    }

    @Scheduled(fixedRate = 60000)
    public void checkUpcomingSessions() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime boundary = now.plusMinutes(15);
        List<Booking> upcomingBookings = bookingRepository.findUpcomingReminders(
                BookingStatus.CANCELLED,
                now,
                boundary
        );

        for (Booking booking : upcomingBookings) {
            try {
                // Send db notification
                String message = String.format(
                        Locale.US,
                        "Reminder: Your session is starting at %s.",
                        booking.getStartTime().toLocalTime().format(TIME_FORMAT)
                );
                
                notificationService.create(booking.getStudent(), message, NotificationType.GENERAL);
                notificationService.create(booking.getTutorProfile().getUser(), message, NotificationType.GENERAL);

                // Send email notification
                String emailSubject = "Upcoming Session Reminder";
                String studentEmailBody = String.format(
                        "Dear %s,\n\nThis is a reminder that your session with tutor %s is starting at %s on %s.\n\nBest regards,\nTutorFinder Team",
                        booking.getStudentName(),
                        booking.getTutorProfile().getUser().getName(),
                        booking.getStartTime().toLocalTime().format(TIME_FORMAT),
                        booking.getStartTime().toLocalDate()
                );
                String tutorEmailBody = String.format(
                        "Dear %s,\n\nThis is a reminder that your session with student %s is starting at %s on %s.\n\nBest regards,\nTutorFinder Team",
                        booking.getTutorProfile().getUser().getName(),
                        booking.getStudentName(),
                        booking.getStartTime().toLocalTime().format(TIME_FORMAT),
                        booking.getStartTime().toLocalDate()
                );

                emailService.sendEmail(booking.getStudentEmail(), emailSubject, studentEmailBody);
                emailService.sendEmail(booking.getTutorProfile().getUser().getEmail(), emailSubject, tutorEmailBody);

                // Mark reminder as sent
                booking.setReminderSent(true);
                bookingRepository.save(booking);
            } catch (Exception e) {
                System.err.println("Error processing upcoming booking reminder for ID " + booking.getId() + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
    }
}
