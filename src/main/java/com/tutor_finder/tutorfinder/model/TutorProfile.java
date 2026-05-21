package com.tutor_finder.tutorfinder.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "tutor_profiles")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TutorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
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

    @Column(columnDefinition = "LONGTEXT")
    private String documentUrl; // Base64 document or certificate path

    private String mapLocation; // Google Map coordinate/address embed

    @Column(length = 20)
    private String status = "PENDING"; // PENDING, VERIFIED, REJECTED
}
