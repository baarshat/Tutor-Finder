package com.tutor_finder.tutorfinder.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tutor_availability")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TutorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tutor_profile_id", nullable = false, unique = true)
    private TutorProfile tutorProfile;

    @Column(nullable = false)
    private Integer timeGap = 0;

    @OneToMany(mappedBy = "availability", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AvailabilityDay> days = new ArrayList<>();

    public void replaceDays(List<AvailabilityDay> newDays) {
        days.clear();
        if (newDays != null) {
            newDays.forEach(day -> day.setAvailability(this));
            days.addAll(newDays);
        }
    }
}
