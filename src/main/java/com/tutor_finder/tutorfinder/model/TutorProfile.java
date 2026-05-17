package com.tutor_finder.tutorfinder.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "tutor_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TutorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String qualifications; // E.g., Bachelor's in Math, certificates

    @Column(columnDefinition = "TEXT")
    private String subjects; // Subjects taught (e.g., Math, Science)

    private Double hourlyRate;

    private Integer experienceYears;

    private String location; // Primary location/address

    private String serviceArea; // Areas they are willing to travel to

    private boolean subscriptionActive = false; // Must pay via eSewa/Khalti for visibility
}
