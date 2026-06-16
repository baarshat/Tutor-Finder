package com.tutor_finder.tutorfinder.service;

import com.tutor_finder.tutorfinder.model.Booking;
import com.tutor_finder.tutorfinder.model.BookingStatus;
import com.tutor_finder.tutorfinder.model.NotificationType;
import com.tutor_finder.tutorfinder.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionReminderService {

    private final BookingRepository bookingRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    /**
     * Runs every 2 minutes to send reminders for sessions starting within 10 minutes.
     * Sends both email and in-app notifications to both student and tutor.
     */
    @Scheduled(fixedDelay = 120000) // Run every 2 minutes
    @Transactional
    public void sendSessionReminders() {
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime in10Minutes = now.plusMinutes(10);

            // Find bookings that are within the next 10 minutes and haven't been reminded yet
            List<Booking> upcomingBookings = bookingRepository.findUpcomingReminders(
                    BookingStatus.CANCELLED,
                    now,
                    in10Minutes
            );

            log.info("Checking for upcoming sessions... Found {} bookings to remind", upcomingBookings.size());

            for (Booking booking : upcomingBookings) {
                sendReminderForBooking(booking);
            }

        } catch (Exception e) {
            log.error("Error sending session reminders", e);
        }
    }

    /**
     * Sends email and notification reminders for a specific booking to both student and tutor.
     */
    private void sendReminderForBooking(Booking booking) {
        try {
            String sessionTime = formatSessionTime(booking.getStartTime());
            String studentName = booking.getStudentName();
            String tutorName = booking.getTutorProfile().getUser().getName();
            String studentEmail = booking.getStudentEmail();
            String tutorEmail = booking.getTutorProfile().getUser().getEmail();

            // Email and notification for STUDENT
            String studentEmailSubject = "Session Reminder: Your tutoring session starts in 10 minutes!";
            String studentEmailBody = buildStudentEmailBody(tutorName, sessionTime);
            emailService.sendEmail(studentEmail, studentEmailSubject, studentEmailBody);

            String studentNotificationMsg = String.format(
                    "Your session with %s starts in 10 minutes at %s",
                    tutorName,
                    sessionTime
            );
            notificationService.create(
                    booking.getStudent(),
                    studentNotificationMsg,
                    NotificationType.BOOKING_REMINDER
            );

            log.info("✅ Student reminder sent: {} ({})", studentName, studentEmail);

            // Email and notification for TUTOR
            String tutorEmailSubject = "Session Reminder: Your tutoring session starts in 10 minutes!";
            String tutorEmailBody = buildTutorEmailBody(studentName, sessionTime);
            emailService.sendEmail(tutorEmail, tutorEmailSubject, tutorEmailBody);

            String tutorNotificationMsg = String.format(
                    "Your session with %s starts in 10 minutes at %s",
                    studentName,
                    sessionTime
            );
            notificationService.create(
                    booking.getTutorProfile().getUser(),
                    tutorNotificationMsg,
                    NotificationType.BOOKING_REMINDER
            );

            log.info("Tutor reminder sent: {} ({})", tutorName, tutorEmail);

            // Mark reminder as sent
            booking.setReminderSent(true);
            bookingRepository.save(booking);

            log.info("Booking {} reminder marked as sent", booking.getId());

        } catch (Exception e) {
            log.error("Error sending reminder for booking {}: {}", booking.getId(), e.getMessage(), e);
        }
    }

    private String formatSessionTime(LocalDateTime startTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");
        return startTime.format(formatter);
    }

    private String buildStudentEmailBody(String tutorName, String sessionTime) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: linear-gradient(135deg, #83b822 0%, #6ba119 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
                                .content { padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
                                .session-info { background: white; padding: 15px; border-left: 4px solid #83b822; margin: 15px 0; }
                                .button { display: inline-block; background: #83b822; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                                .footer { margin-top: 20px; font-size: 12px; color: #666; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>📚 Session Reminder</h1>
                                </div>
                                <div class="content">
                                    <p>Hi there,</p>
                                    <p>Your tutoring session is <strong>starting in 10 minutes</strong>! 🎉</p>
                                    
                                    <div class="session-info">
                                        <p><strong>Session Details:</strong></p>
                                        <p>📝 <strong>Tutor:</strong> %s</p>
                                        <p>⏰ <strong>Time:</strong> %s</p>
                                    </div>
                                    
                                    <p>Make sure you're ready to join!</p>
                                    
                                    <p>If you have any questions or need to reschedule, please contact your tutor or visit your bookings page.</p>
                                    
                                    <p>Good luck! 🚀</p>
                                    
                                    <div class="footer">
                                        <p>TutorFinder Team</p>
                                        <p>This is an automated reminder. Please do not reply to this email.</p>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                tutorName, sessionTime
        );
    }

    private String buildTutorEmailBody(String studentName, String sessionTime) {
        return String.format(
                """
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <style>
                                body { font-family: Arial, sans-serif; color: #333; }
                                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                                .header { background: linear-gradient(135deg, #83b822 0%, #6ba119 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
                                .content { padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 0 0 8px 8px; }
                                .session-info { background: white; padding: 15px; border-left: 4px solid #83b822; margin: 15px 0; }
                                .button { display: inline-block; background: #83b822; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 15px 0; }
                                .footer { margin-top: 20px; font-size: 12px; color: #666; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <div class="header">
                                    <h1>📚 Session Reminder</h1>
                                </div>
                                <div class="content">
                                    <p>Hi,</p>
                                    <p>You have a tutoring session <strong>starting in 10 minutes</strong>! 🎉</p>
                                    
                                    <div class="session-info">
                                        <p><strong>Session Details:</strong></p>
                                        <p>👨‍🎓 <strong>Student:</strong> %s</p>
                                        <p>⏰ <strong>Time:</strong> %s</p>
                                    </div>
                                    
                                    <p>Please be ready to begin the session. Ensure you have all necessary materials prepared.</p>
                                    
                                    <p>If you need to reschedule or have any questions, please contact the student or visit your bookings page.</p>
                                    
                                    <p>Best of luck with your session! 🚀</p>
                                    
                                    <div class="footer">
                                        <p>TutorFinder Team</p>
                                        <p>This is an automated reminder. Please do not reply to this email.</p>
                                    </div>
                                </div>
                            </div>
                        </body>
                        </html>
                        """,
                studentName, sessionTime
        );
    }
}
