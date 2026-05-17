package com.tutor_finder.tutorfinder.controller;

import com.tutor_finder.tutorfinder.model.TutorProfile;
import com.tutor_finder.tutorfinder.service.TutorProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tutors")
public class TutorController {

    private final TutorProfileService tutorProfileService;

    @Autowired
    public TutorController(TutorProfileService tutorProfileService) {
        this.tutorProfileService = tutorProfileService;
    }

    @GetMapping
    public ResponseEntity<List<TutorProfile>> getAllTutors() {
        List<TutorProfile> tutors = tutorProfileService.getAllTutorProfiles();
        return new ResponseEntity<>(tutors, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TutorProfile> getTutorById(@PathVariable Long id) {
        return tutorProfileService.getTutorProfileById(id)
                .map(tutor -> new ResponseEntity<>(tutor, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<TutorProfile> getTutorByUserId(@PathVariable Long userId) {
        return tutorProfileService.getTutorProfileByUserId(userId)
                .map(tutor -> new ResponseEntity<>(tutor, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<TutorProfile> createTutor(@RequestBody TutorProfile tutorProfile) {
        TutorProfile savedTutor = tutorProfileService.saveTutorProfile(tutorProfile);
        return new ResponseEntity<>(savedTutor, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TutorProfile> updateTutor(@PathVariable Long id, @RequestBody TutorProfile tutorDetails) {
        return tutorProfileService.getTutorProfileById(id)
                .map(existingTutor -> {
                    existingTutor.setQualifications(tutorDetails.getQualifications());
                    existingTutor.setSubjects(tutorDetails.getSubjects());
                    existingTutor.setHourlyRate(tutorDetails.getHourlyRate());
                    existingTutor.setExperienceYears(tutorDetails.getExperienceYears());
                    existingTutor.setLocation(tutorDetails.getLocation());
                    existingTutor.setServiceArea(tutorDetails.getServiceArea());
                    existingTutor.setSubscriptionActive(tutorDetails.isSubscriptionActive());
                    TutorProfile updated = tutorProfileService.saveTutorProfile(existingTutor);
                    return new ResponseEntity<>(updated, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTutor(@PathVariable Long id) {
        return tutorProfileService.getTutorProfileById(id)
                .map(tutor -> {
                    tutorProfileService.deleteTutorProfile(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
