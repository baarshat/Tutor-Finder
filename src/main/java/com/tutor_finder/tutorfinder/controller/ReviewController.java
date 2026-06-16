package com.tutor_finder.tutorfinder.controller;

import com.tutor_finder.tutorfinder.dto.ReviewRequest;
import com.tutor_finder.tutorfinder.dto.ReviewResponse;
import com.tutor_finder.tutorfinder.model.User;
import com.tutor_finder.tutorfinder.repository.ReviewRepository;
import com.tutor_finder.tutorfinder.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewRepository reviewRepository;

    /**
     * POST /api/reviews
     * Submit a review for a completed booking. Students only.
     */
    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(
            @AuthenticationPrincipal User user,
            @RequestBody ReviewRequest request) {
        if (user == null) {
            throw new AccessDeniedException("User not authenticated");
        }
        ReviewResponse response = reviewService.createReview(user, request);
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/reviews/tutor/{tutorProfileId}
     * Publicly accessible - returns all reviews for a tutor.
     */
    @GetMapping("/tutor/{tutorProfileId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsForTutor(
            @PathVariable Long tutorProfileId) {
        return ResponseEntity.ok(reviewService.getReviewsForTutor(tutorProfileId));
    }

    /**
     * GET /api/reviews/tutor/{tutorProfileId}/stats
     * Returns average rating, total count, and distribution for a tutor.
     */
    @GetMapping("/tutor/{tutorProfileId}/stats")
    public ResponseEntity<Map<String, Object>> getTutorReviewStats(
            @PathVariable Long tutorProfileId) {
        Double avg = reviewRepository.findAverageRatingByTutorProfileId(tutorProfileId);
        Long count = reviewRepository.countByTutorProfileId(tutorProfileId);

        // Build star distribution map (1..5)
        Map<Integer, Long> distribution = new HashMap<>();
        for (int star = 1; star <= 5; star++) {
            final int s = star;
            long starCount = reviewRepository
                    .findByTutorProfileIdOrderByCreatedAtDesc(tutorProfileId)
                    .stream()
                    .filter(r -> r.getRating() == s)
                    .count();
            distribution.put(star, starCount);
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        stats.put("reviewCount", count != null ? count : 0L);
        stats.put("distribution", distribution);
        return ResponseEntity.ok(stats);
    }

    /**
     * DELETE /api/reviews/{reviewId}
     * Allows the student who authored the review to delete it.
     */
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @AuthenticationPrincipal User user,
            @PathVariable Long reviewId) {
        if (user == null) {
            throw new AccessDeniedException("User not authenticated");
        }
        reviewService.deleteReview(user, reviewId);
        return ResponseEntity.noContent().build();
    }
}
