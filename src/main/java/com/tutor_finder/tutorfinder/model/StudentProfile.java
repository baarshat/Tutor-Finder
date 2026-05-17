package com.tutor_finder.tutorfinder.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "student_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String currentClass; // e.g., "Class 10", "+2 Science"

    @Column(columnDefinition = "TEXT")
    private String preferredSubjects; // Subjects they need help with

    private String preferredLocation; // Based location for proximity searches
}
