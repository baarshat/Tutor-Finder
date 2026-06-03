package com.tutor_finder.tutorfinder.service;

import com.tutor_finder.tutorfinder.model.TutorProfile;
import com.tutor_finder.tutorfinder.repository.TutorProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TutorProfileService {

    private final TutorProfileRepository tutorProfileRepository;

    @Autowired
    public TutorProfileService(TutorProfileRepository tutorProfileRepository) {
        this.tutorProfileRepository = tutorProfileRepository;
    }

    public List<TutorProfile> getAllTutorProfiles() {
        return tutorProfileRepository.findAll();
    }

    public Optional<TutorProfile> getTutorProfileById(Long id) {
        return tutorProfileRepository.findById(id);
    }

    public Optional<TutorProfile> getTutorProfileByUserId(Long userId) {
        return tutorProfileRepository.findByUserId(userId);
    }

    public TutorProfile saveTutorProfile(TutorProfile tutorProfile) {
        return tutorProfileRepository.save(tutorProfile);
    }

    public void deleteTutorProfile(Long id) {
        tutorProfileRepository.deleteById(id);
    }
}
