package com.tutor_finder.tutorfinder.service;

import com.tutor_finder.tutorfinder.dto.ReviewRequest;
import com.tutor_finder.tutorfinder.dto.ReviewResponse;
import com.tutor_finder.tutorfinder.model.*;
import com.tutor_finder.tutorfinder.repository.BookingRepository;
import com.tutor_finder.tutorfinder.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    public ReviewResponse createReview(User student, ReviewRequest request) {
        if (student == null) {
            throw new AccessDeniedException("User not authenticated");
        }
        if (student.getRole() != Role.STUDENT) {
            throw new AccessDeniedException("Only students can submit reviews");
        }
        if (request.getBookingId() == null) {
            throw new IllegalArgumentException("Booking ID is required");
        }
        if (request.getRating() == null || request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new NoSuchElementException("Booking not found"));

        // Verify ownership
        if (!booking.getStudent().getId().equals(student.getId())) {
            throw new AccessDeniedException("You can only review your own sessions");
        }

        // Must be completed
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("You can only review sessions that have been marked as completed by the tutor");
        }

        // Prevent duplicate reviews
        if (reviewRepository.existsByBookingId(request.getBookingId())) {
            throw new IllegalArgumentException("You have already reviewed this session");
        }

        Review review = Review.builder()
                .booking(booking)
                .tutorProfile(booking.getTutorProfile())
                .student(student)
                .rating(request.getRating())
                .comment(request.getComment())
                .studentName(booking.getStudentName())
                .build();

        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsForTutor(Long tutorProfileId) {
        return reviewRepository.findByTutorProfileIdOrderByCreatedAtDesc(tutorProfileId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public void deleteReview(User student, Long reviewId) {
        if (student == null) {
            throw new AccessDeniedException("User not authenticated");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NoSuchElementException("Review not found"));

        // Only the student who wrote the review can delete it
        if (!review.getStudent().getId().equals(student.getId())) {
            throw new AccessDeniedException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .bookingId(review.getBooking().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .studentName(review.getStudentName())
                .createdAt(review.getCreatedAt())
                .tutorProfileId(review.getTutorProfile().getId())
                .studentId(review.getStudent().getId())
                .build();
    }
}
