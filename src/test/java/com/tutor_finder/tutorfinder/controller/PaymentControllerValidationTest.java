package com.tutor_finder.tutorfinder.controller;

import com.tutor_finder.tutorfinder.model.User;
import com.tutor_finder.tutorfinder.repository.PaymentRepository;
import com.tutor_finder.tutorfinder.repository.TutorProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verifyNoInteractions;

class PaymentControllerValidationTest {

    private PaymentRepository paymentRepository;
    private TutorProfileRepository tutorProfileRepository;
    private PaymentController paymentController;

    @BeforeEach
    void setUp() {
        paymentRepository = Mockito.mock(PaymentRepository.class);
        tutorProfileRepository = Mockito.mock(TutorProfileRepository.class);
        paymentController = new PaymentController(paymentRepository, tutorProfileRepository);
    }

    @Test
    void initiatePaymentRejectsNegativeExperienceYears() {
        PaymentController.InitiatePaymentRequest request = validRequest();
        request.setExperienceYears(-1);

        ResponseEntity<?> response = paymentController.initiatePayment(authenticatedUser(), request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verifyNoInteractions(paymentRepository, tutorProfileRepository);
    }

    @Test
    void initiatePaymentRejectsMissingVerificationDocuments() {
        PaymentController.InitiatePaymentRequest request = validRequest();
        request.setTutorImageUrl(null);

        ResponseEntity<?> response = paymentController.initiatePayment(authenticatedUser(), request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verifyNoInteractions(paymentRepository, tutorProfileRepository);
    }

    private PaymentController.InitiatePaymentRequest validRequest() {
        PaymentController.InitiatePaymentRequest request = new PaymentController.InitiatePaymentRequest();
        request.setQualifications("BSc");
        request.setSubjects("Math");
        request.setHourlyRate(500.0);
        request.setExperienceYears(2);
        request.setLocation("Kathmandu");
        request.setServiceArea("Lalitpur");
        request.setTutorImageUrl("image-base64");
        request.setCertificationDocumentUrl("cert-base64");
        request.setCitizenshipDocumentUrl("nid-base64");
        request.setAmount(500.0);
        return request;
    }

    private User authenticatedUser() {
        User user = new User();
        user.setId(1L);
        user.setName("Test Tutor");
        user.setEmail("tutor@example.com");
        user.setPhone("9800000000");
        return user;
    }
}
