package com.tutor_finder.tutorfinder.repository;

import com.tutor_finder.tutorfinder.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByTutorProfileIdOrderByCreatedAtDesc(Long tutorProfileId);

    Optional<Review> findByBookingId(Long bookingId);

    boolean existsByBookingId(Long bookingId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.tutorProfile.id = :tutorProfileId")
    Double findAverageRatingByTutorProfileId(@Param("tutorProfileId") Long tutorProfileId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.tutorProfile.id = :tutorProfileId")
    Long countByTutorProfileId(@Param("tutorProfileId") Long tutorProfileId);

    @Query("SELECT COUNT(r), SUM(CASE WHEN r.rating = :star THEN 1 ELSE 0 END) FROM Review r WHERE r.tutorProfile.id = :tutorProfileId")
    Object[] findRatingDistributionByTutorProfileId(@Param("tutorProfileId") Long tutorProfileId, @Param("star") int star);

    List<Review> findByStudentId(Long studentId);
}
