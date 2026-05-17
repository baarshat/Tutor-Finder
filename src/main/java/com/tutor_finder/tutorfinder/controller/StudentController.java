package com.tutor_finder.tutorfinder.controller;

import com.tutor_finder.tutorfinder.model.StudentProfile;
import com.tutor_finder.tutorfinder.service.StudentProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentProfileService studentProfileService;

    @Autowired
    public StudentController(StudentProfileService studentProfileService) {
        this.studentProfileService = studentProfileService;
    }

    @GetMapping
    public ResponseEntity<List<StudentProfile>> getAllStudents() {
        List<StudentProfile> students = studentProfileService.getAllStudentProfiles();
        return new ResponseEntity<>(students, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentProfile> getStudentById(@PathVariable Long id) {
        return studentProfileService.getStudentProfileById(id)
                .map(student -> new ResponseEntity<>(student, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<StudentProfile> getStudentByUserId(@PathVariable Long userId) {
        return studentProfileService.getStudentProfileByUserId(userId)
                .map(student -> new ResponseEntity<>(student, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<StudentProfile> createStudent(@RequestBody StudentProfile studentProfile) {
        StudentProfile savedStudent = studentProfileService.saveStudentProfile(studentProfile);
        return new ResponseEntity<>(savedStudent, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentProfile> updateStudent(@PathVariable Long id, @RequestBody StudentProfile studentDetails) {
        return studentProfileService.getStudentProfileById(id)
                .map(existingStudent -> {
                    existingStudent.setCurrentClass(studentDetails.getCurrentClass());
                    existingStudent.setPreferredSubjects(studentDetails.getPreferredSubjects());
                    existingStudent.setPreferredLocation(studentDetails.getPreferredLocation());
                    StudentProfile updated = studentProfileService.saveStudentProfile(existingStudent);
                    return new ResponseEntity<>(updated, HttpStatus.OK);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        return studentProfileService.getStudentProfileById(id)
                .map(student -> {
                    studentProfileService.deleteStudentProfile(id);
                    return new ResponseEntity<Void>(HttpStatus.NO_CONTENT);
                })
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
