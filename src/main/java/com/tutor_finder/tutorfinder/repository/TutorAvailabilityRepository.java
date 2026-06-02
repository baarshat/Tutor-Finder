package com.tutor_finder.tutorfinder.repository;

import com.tutor_finder.tutorfinder.model.TutorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TutorAvailabilityRepository extends JpaRepository<TutorAvailability, Long> {
    Optional<TutorAvailability> findByTutorProfileId(Long tutorProfileId);
}
