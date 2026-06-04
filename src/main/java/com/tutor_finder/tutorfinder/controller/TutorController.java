package com.tutor_finder.tutorfinder.controller;

import com.tutor_finder.tutorfinder.model.TutorProfile;
import com.tutor_finder.tutorfinder.model.User;
import com.tutor_finder.tutorfinder.repository.UserRepository;
import com.tutor_finder.tutorfinder.service.TutorProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tutors")
public class TutorController {

    private final TutorProfileService tutorProfileService;
    private final UserRepository userRepository;

    @Autowired
    public TutorController(TutorProfileService tutorProfileService, UserRepository userRepository) {
        this.tutorProfileService = tutorProfileService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllTutors() {
        List<TutorProfile> tutors = tutorProfileService.getAllTutorProfiles();
        List<Map<String, Object>> response = tutors.stream()
                .map(this::toTutorSummary)
                .toList();
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getTutorById(@PathVariable Long id) {
        return tutorProfileService.getTutorProfileById(id)
                .map(tutor -> new ResponseEntity<>(toTutorSummary(tutor), HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getTutorByUserId(@PathVariable Long userId) {
        return tutorProfileService.getTutorProfileByUserId(userId)
                .map(tutor -> new ResponseEntity<>(toTutorSummary(tutor), HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<TutorProfile> createTutor(@RequestBody TutorProfile tutorProfile) {
        TutorProfile savedTutor = tutorProfileService.saveTutorProfile(tutorProfile);
        return new ResponseEntity<>(savedTutor, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/verify")
    public ResponseEntity<TutorProfile> verifyTutor(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        boolean verified = body.getOrDefault("verified", false);
        return tutorProfileService.getTutorProfileById(id)
                .map(existingTutor -> {
                    User user = existingTutor.getUser();
                    if (user != null) {
                        user.setVerified(verified);
                        userRepository.save(user);
                    }
                    existingTutor.setSubscriptionActive(verified);
                    existingTutor.setStatus(verified ? "VERIFIED" : "PENDING");
                    TutorProfile updated = tutorProfileService.saveTutorProfile(existingTutor);
                    return new ResponseEntity<>(updated, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
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
                    existingTutor.setDocumentUrl(tutorDetails.getDocumentUrl());
                    existingTutor.setMapLocation(tutorDetails.getMapLocation());
                    existingTutor.setStatus(tutorDetails.getStatus());
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

    private Map<String, Object> toTutorSummary(TutorProfile tutor) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("id", tutor.getId());
        summary.put("qualifications", tutor.getQualifications());
        summary.put("subjects", tutor.getSubjects());
        summary.put("hourlyRate", tutor.getHourlyRate());
        summary.put("experienceYears", tutor.getExperienceYears());
        summary.put("location", tutor.getLocation());
        summary.put("serviceArea", tutor.getServiceArea());
        summary.put("subscriptionActive", tutor.isSubscriptionActive());
        summary.put("documentUrl", tutor.getDocumentUrl());
        summary.put("mapLocation", tutor.getMapLocation());
        summary.put("status", tutor.getStatus());

        User user = tutor.getUser();
        if (user != null) {
            summary.put("userId", user.getId());
            summary.put("userName", user.getName());
            summary.put("userEmail", user.getEmail());
            summary.put("userPhone", user.getPhone());
            summary.put("verified", user.isVerified());
        } else {
            summary.put("verified", false);
        }

        return summary;
    }
}