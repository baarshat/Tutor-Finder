package com.tutor_finder.tutorfinder.service;

import com.tutor_finder.tutorfinder.dto.AvailabilityDateSlots;
import com.tutor_finder.tutorfinder.dto.AvailabilityDayRequest;
import com.tutor_finder.tutorfinder.dto.AvailabilityRequest;
import com.tutor_finder.tutorfinder.model.*;
import com.tutor_finder.tutorfinder.repository.BookingRepository;
import com.tutor_finder.tutorfinder.repository.TutorAvailabilityRepository;
import com.tutor_finder.tutorfinder.repository.TutorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AvailabilityService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");
    private static final List<String> WEEK_DAYS = List.of(
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday"
    );

    private final TutorProfileRepository tutorProfileRepository;
    private final TutorAvailabilityRepository tutorAvailabilityRepository;
    private final BookingRepository bookingRepository;

    public Map<String, Object> getAvailabilityForTutor(User user) {
        if (user == null || user.getRole() != Role.TUTOR) {
            throw new AccessDeniedException("Only tutors can access availability");
        }

        TutorProfile tutorProfile = tutorProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Tutor profile not found"));

        Optional<TutorAvailability> availabilityOpt = tutorAvailabilityRepository.findByTutorProfileId(tutorProfile.getId());

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("timeGap", availabilityOpt.map(TutorAvailability::getTimeGap).orElse(0));

        Map<DayOfWeek, AvailabilityDay> dayMap = availabilityOpt
                .map(TutorAvailability::getDays)
                .orElseGet(List::of)
                .stream()
                .collect(Collectors.toMap(AvailabilityDay::getDay, day -> day));

        for (String dayName : WEEK_DAYS) {
            DayOfWeek dayOfWeek = DayOfWeek.valueOf(dayName.toUpperCase());
            AvailabilityDay day = dayMap.get(dayOfWeek);
            Map<String, Object> dayPayload = new HashMap<>();
            dayPayload.put("isAvailable", day != null);
            dayPayload.put("startTime", day != null ? day.getStartTime().format(TIME_FORMAT) : "09:00");
            dayPayload.put("endTime", day != null ? day.getEndTime().format(TIME_FORMAT) : "17:00");
            response.put(dayName, dayPayload);
        }

        return response;
    }

    public Map<String, Object> updateAvailability(User user, AvailabilityRequest request) {
        if (user == null || user.getRole() != Role.TUTOR) {
            throw new AccessDeniedException("Only tutors can update availability");
        }

        TutorProfile tutorProfile = tutorProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Tutor profile not found"));

        int timeGap = Optional.ofNullable(request.getTimeGap()).orElse(0);
        if (timeGap < 0) {
            throw new IllegalArgumentException("Time gap must be zero or positive");
        }

        List<AvailabilityDay> days = new ArrayList<>();
        for (Map.Entry<String, AvailabilityDayRequest> entry : request.getDays().entrySet()) {
            AvailabilityDayRequest dayRequest = entry.getValue();
            if (dayRequest == null || !dayRequest.isAvailable()) {
                continue;
            }

            DayOfWeek dayOfWeek = DayOfWeek.valueOf(entry.getKey().toUpperCase());
            LocalTime startTime = LocalTime.parse(dayRequest.getStartTime());
            LocalTime endTime = LocalTime.parse(dayRequest.getEndTime());

            if (!endTime.isAfter(startTime)) {
                throw new IllegalArgumentException("End time must be after start time for " + entry.getKey());
            }

            days.add(AvailabilityDay.builder()
                    .day(dayOfWeek)
                    .startTime(startTime)
                    .endTime(endTime)
                    .build());
        }

        TutorAvailability availability = tutorAvailabilityRepository.findByTutorProfileId(tutorProfile.getId())
                .orElseGet(() -> TutorAvailability.builder()
                        .tutorProfile(tutorProfile)
                        .build());

        availability.setTimeGap(timeGap);
        availability.replaceDays(days);
        tutorAvailabilityRepository.save(availability);

        return getAvailabilityForTutor(user);
    }

    public List<AvailabilityDateSlots> getAvailabilitySlots(Long tutorProfileId, int durationMinutes) {
        TutorProfile tutorProfile = tutorProfileRepository.findById(tutorProfileId)
                .orElseThrow(() -> new IllegalArgumentException("Tutor profile not found"));

        Optional<TutorAvailability> availabilityOpt = tutorAvailabilityRepository.findByTutorProfileId(tutorProfile.getId());
        if (availabilityOpt.isEmpty()) {
            return List.of();
        }

        TutorAvailability availability = availabilityOpt.get();
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = startDate.plusDays(30);
        LocalDateTime rangeStart = startDate.atStartOfDay();
        LocalDateTime rangeEnd = endDate.plusDays(1).atStartOfDay();

        List<Booking> bookings = bookingRepository.findByTutorProfileIdAndStatusNotAndStartTimeBetween(
                tutorProfileId,
                BookingStatus.CANCELLED,
                rangeStart,
                rangeEnd
        );

        Map<LocalDate, List<Booking>> bookingsByDate = bookings.stream()
                .collect(Collectors.groupingBy(booking -> booking.getStartTime().toLocalDate()));

        List<AvailabilityDateSlots> availableDates = new ArrayList<>();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            DayOfWeek dayOfWeek = date.getDayOfWeek();
            AvailabilityDay day = availability.getDays()
                    .stream()
                    .filter(d -> d.getDay() == dayOfWeek)
                    .findFirst()
                    .orElse(null);

            if (day == null) {
                continue;
            }

            int timeGap = availability.getTimeGap() == null ? 0 : availability.getTimeGap();
            List<String> slots = generateAvailableTimeSlots(
                    date,
                    day,
                    durationMinutes,
                    bookingsByDate.getOrDefault(date, List.of()),
                    timeGap
            );

            if (!slots.isEmpty()) {
                availableDates.add(new AvailabilityDateSlots(date.format(DATE_FORMAT), slots));
            }
        }

        return availableDates;
    }

   private List<String> generateAvailableTimeSlots(
        LocalDate date,
        AvailabilityDay availabilityDay,
        int durationMinutes,
        List<Booking> bookings,
        int timeGap
) {
    List<String> slots = new ArrayList<>();

    LocalDateTime currentTime = LocalDateTime.of(date, availabilityDay.getStartTime());
    LocalDateTime endTime = LocalDateTime.of(date, availabilityDay.getEndTime());

    if (!endTime.isAfter(currentTime)) {
        return slots;
    }

    LocalDateTime now = LocalDateTime.now();
    if (date.equals(now.toLocalDate()) && currentTime.isBefore(now)) {
        currentTime = now.plusMinutes(timeGap);
    }

    while (currentTime.plusMinutes(durationMinutes).isBefore(endTime)
            || currentTime.plusMinutes(durationMinutes).isEqual(endTime)) {

        LocalDateTime slotStart = currentTime;
        LocalDateTime slotEnd = slotStart.plusMinutes(durationMinutes);

        boolean isAvailable = bookings.stream().noneMatch(booking ->
                slotStart.isBefore(booking.getEndTime())
                        && slotEnd.isAfter(booking.getStartTime())
        );

        if (isAvailable) {
            slots.add(slotStart.toLocalTime().format(TIME_FORMAT));
        }

        currentTime = slotEnd;
    }

    return slots;
 }
}
