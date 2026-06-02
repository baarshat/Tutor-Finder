package com.tutor_finder.tutorfinder.repository;

import com.tutor_finder.tutorfinder.model.Booking;
import com.tutor_finder.tutorfinder.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("SELECT b FROM Booking b WHERE b.tutorProfile.id = :tutorProfileId AND b.status != :status AND b.startTime BETWEEN :start AND :end")
    List<Booking> findByTutorProfileIdAndStatusNotAndStartTimeBetween(
            @Param("tutorProfileId") Long tutorProfileId,
            @Param("status") BookingStatus status,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );

    @Query("SELECT b FROM Booking b WHERE b.tutorProfile.id = :tutorProfileId AND b.status != :status")
    List<Booking> findByTutorProfileIdAndStatusNot(
            @Param("tutorProfileId") Long tutorProfileId,
            @Param("status") BookingStatus status
    );

    @Query("SELECT b FROM Booking b WHERE b.student.id = :studentId AND b.status != :status")
    List<Booking> findByStudentIdAndStatusNot(
            @Param("studentId") Long studentId,
            @Param("status") BookingStatus status
    );
}
