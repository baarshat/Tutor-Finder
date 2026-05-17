package com.tutor_finder.tutorfinder.service;

import com.tutor_finder.tutorfinder.model.StudentProfile;
import com.tutor_finder.tutorfinder.repository.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentProfileService {

    private final StudentProfileRepository studentProfileRepository;

    @Autowired
    public StudentProfileService(StudentProfileRepository studentProfileRepository) {
        this.studentProfileRepository = studentProfileRepository;
    }

    public List<StudentProfile> getAllStudentProfiles() {
        return studentProfileRepository.findAll();
    }

    public Optional<StudentProfile> getStudentProfileById(Long id) {
        return studentProfileRepository.findById(id);
    }

    public Optional<StudentProfile> getStudentProfileByUserId(Long userId) {
        return studentProfileRepository.findByUserId(userId);
    }

    public StudentProfile saveStudentProfile(StudentProfile studentProfile) {
        return studentProfileRepository.save(studentProfile);
    }

    public void deleteStudentProfile(Long id) {
        studentProfileRepository.deleteById(id);
    }
}
