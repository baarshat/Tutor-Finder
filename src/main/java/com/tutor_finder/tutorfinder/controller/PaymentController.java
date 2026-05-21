package com.tutor_finder.tutorfinder.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tutor_finder.tutorfinder.model.Payment;
import com.tutor_finder.tutorfinder.model.TutorProfile;
import com.tutor_finder.tutorfinder.model.User;
import com.tutor_finder.tutorfinder.repository.PaymentRepository;
import com.tutor_finder.tutorfinder.repository.TutorProfileRepository;
import com.tutor_finder.tutorfinder.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRepository paymentRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${khalti.initiate-url:https://dev.khalti.com/api/v2/epayment/initiate/}")
    private String khaltiInitiateUrl;

    @Value("${khalti.lookup-url:https://dev.khalti.com/api/v2/epayment/lookup/}")
    private String khaltiLookupUrl;

    @Value("${khalti.secret-key:}")
    private String khaltiSecretKey;

    private static final String MERCHANT_CODE = "EPAYTEST";
    private static final String SECRET_KEY = "8gBm/:&EnhH.1/q";
    private static final String ESEWA_URL = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    @Data
    public static class InitiatePaymentRequest {
        private String qualifications;
        private String subjects;
        private Double hourlyRate;
        private Integer experienceYears;
        private String location;
        private String serviceArea;
        private String documentUrl;
        private String mapLocation;
        private Double amount;
        private String paymentGateway;
    }

    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(
            @AuthenticationPrincipal User user,
            @RequestBody InitiatePaymentRequest request) {
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        try {
            // 1. Get or create TutorProfile associated with the logged-in user
            TutorProfile tutorProfile = tutorProfileRepository.findByUserId(user.getId())
                    .orElse(new TutorProfile());
            
            tutorProfile.setUser(user);
            tutorProfile.setQualifications(request.getQualifications());
            tutorProfile.setSubjects(request.getSubjects());
            tutorProfile.setHourlyRate(request.getHourlyRate());
            tutorProfile.setExperienceYears(request.getExperienceYears());
            tutorProfile.setLocation(request.getLocation());
            tutorProfile.setServiceArea(request.getServiceArea());
            tutorProfile.setDocumentUrl(request.getDocumentUrl());
            tutorProfile.setMapLocation(request.getMapLocation());
            tutorProfile.setSubscriptionActive(false);
            tutorProfile.setStatus("PENDING");
            tutorProfileRepository.saveAndFlush(tutorProfile);

                String gateway = Optional.ofNullable(request.getPaymentGateway())
                    .orElse("ESEWA")
                    .trim()
                    .toUpperCase(Locale.ROOT);

                // 2. Generate Unique Transaction UUID
                String transactionUuid = UUID.randomUUID().toString() + "-" + System.currentTimeMillis();

                // 3. Create a Pending Payment Record
            Payment payment = Payment.builder()
                    .user(user)
                    .amount(request.getAmount())
                    .transactionUuid(transactionUuid)
                    .status("PENDING")
                    .paymentDate(LocalDateTime.now())
                    .build();
            paymentRepository.saveAndFlush(payment);

                if ("KHALTI".equals(gateway)) {
                if (khaltiSecretKey == null || khaltiSecretKey.isBlank()) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Khalti secret key is not configured");
                }

                Map<String, Object> khaltiConfig = new HashMap<>();
                khaltiConfig.put("return_url", "http://localhost:5173/tutor/payment-success?method=khalti");
                khaltiConfig.put("website_url", "http://localhost:5173");
                khaltiConfig.put("amount", Math.round(request.getAmount() * 100));
                khaltiConfig.put("purchase_order_id", transactionUuid);
                khaltiConfig.put("purchase_order_name", "Tutor Verification");
                khaltiConfig.put("customer_info", Map.of(
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "phone", user.getPhone()
                ));

                java.net.http.HttpRequest httpRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(URI.create(khaltiInitiateUrl))
                    .header("Authorization", "Key " + khaltiSecretKey)
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(khaltiConfig)))
                    .build();

                java.net.http.HttpResponse<String> httpResponse = java.net.http.HttpClient.newHttpClient()
                    .send(httpRequest, java.net.http.HttpResponse.BodyHandlers.ofString());

                if (httpResponse.statusCode() < 200 || httpResponse.statusCode() >= 300) {
                    throw new IllegalStateException("Khalti payment initiation failed: " + httpResponse.body());
                }

                Map<String, Object> khaltiResponse = objectMapper.readValue(httpResponse.body(), Map.class);
                String paymentUrl = Objects.toString(khaltiResponse.get("payment_url"), null);
                String pidx = Objects.toString(khaltiResponse.get("pidx"), null);

                if (paymentUrl == null || pidx == null) {
                    throw new IllegalStateException("Invalid Khalti response");
                }

                payment.setTransactionId(pidx);
                paymentRepository.save(payment);

                Map<String, Object> response = new HashMap<>();
                response.put("khalti_payment_url", paymentUrl);
                response.put("pidx", pidx);
                response.put("purchase_order_id", transactionUuid);
                response.put("method", "KHALTI");
                return ResponseEntity.ok(response);
                }

                // 4. Generate eSewa v2 signature
                String totalAmountStr = String.format("%.0f", request.getAmount());
                String signatureData = "total_amount=" + totalAmountStr +
                    ",transaction_uuid=" + transactionUuid +
                    ",product_code=" + MERCHANT_CODE;

                String signature = generateHmacSha256(signatureData, SECRET_KEY);

                // 5. Build response payload with form fields
                Map<String, Object> response = new HashMap<>();
                response.put("amount", totalAmountStr);
                response.put("tax_amount", "0");
                response.put("total_amount", totalAmountStr);
                response.put("transaction_uuid", transactionUuid);
                response.put("product_code", MERCHANT_CODE);
                response.put("product_service_charge", "0");
                response.put("product_delivery_charge", "0");
                response.put("success_url", "http://localhost:5173/tutor/payment-success");
                response.put("failure_url", "http://localhost:5173/tutor/payment-failure");
                response.put("signed_field_names", "total_amount,transaction_uuid,product_code");
                response.put("signature", signature);
                response.put("esewa_url", ESEWA_URL);
                response.put("method", "ESEWA");

                return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error initiating payment: " + e.getMessage());
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> body) {
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
        }

        String method = Optional.ofNullable(body.get("method"))
                .orElse("ESEWA")
                .trim()
                .toUpperCase(Locale.ROOT);

        try {
            if ("KHALTI".equals(method)) {
                return verifyKhaltiPayment(user, body);
            }

            String encodedData = body.get("data");
            if (encodedData == null || encodedData.isEmpty()) {
                return ResponseEntity.badRequest().body("Payment callback data is missing");
            }

            // 1. Decode base64 callback data from eSewa
            byte[] decodedBytes = Base64.getDecoder().decode(encodedData);
            String decodedString = new String(decodedBytes);
            Map<String, String> callbackData = objectMapper.readValue(decodedString, Map.class);

            String status = callbackData.get("status");
            String transactionUuid = callbackData.get("transaction_uuid");
            String transactionCode = callbackData.get("transaction_code");
            String signature = callbackData.get("signature");
            String signedFieldNames = callbackData.get("signed_field_names");

            if (!"COMPLETE".equalsIgnoreCase(status)) {
                return ResponseEntity.badRequest().body("Payment was not completed successfully");
            }

            // 2. Re-verify the signature
            // Reconstruct the sign string: key1=value1,key2=value2... based on signed_field_names
            String[] fields = signedFieldNames.split(",");
            StringBuilder signBuilder = new StringBuilder();
            for (int i = 0; i < fields.length; i++) {
                String fieldName = fields[i].trim();
                signBuilder.append(fieldName).append("=").append(callbackData.get(fieldName));
                if (i < fields.length - 1) {
                    signBuilder.append(",");
                }
            }

            String computedSignature = generateHmacSha256(signBuilder.toString(), SECRET_KEY);
            if (!computedSignature.equals(signature)) {
                return ResponseEntity.badRequest().body("Signature verification failed!");
            }

            // 3. Find and update the Payment record
            Payment payment = paymentRepository.findByTransactionUuid(transactionUuid)
                    .orElseThrow(() -> new NoSuchElementException("Payment record not found"));
            
            payment.setStatus("SUCCESS");
            payment.setTransactionId(transactionCode);
            paymentRepository.save(payment);

            // 4. Update the TutorProfile subscription state and pending status
            TutorProfile tutorProfile = tutorProfileRepository.findByUserId(payment.getUser().getId())
                    .orElseThrow(() -> new NoSuchElementException("Tutor profile not found"));
            
            tutorProfile.setSubscriptionActive(true);
            tutorProfile.setStatus("PENDING"); // Stays pending for Superadmin physical verification
            tutorProfileRepository.save(tutorProfile);

                User paymentUser = payment.getUser();
                paymentUser.setVerified(true);
                userRepository.save(paymentUser);

            return ResponseEntity.ok(Map.of("message", "Payment successfully verified and profile submitted!"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Verification error: " + e.getMessage());
        }
    }

    private String generateHmacSha256(String data, String secret) throws Exception {
        SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(secretKeySpec);
        byte[] rawHmac = mac.doFinal(data.getBytes());
        return Base64.getEncoder().encodeToString(rawHmac);
    }

    private ResponseEntity<?> verifyKhaltiPayment(User user, Map<String, String> body) {
        String pidx = Optional.ofNullable(body.get("pidx")).orElse(body.get("transaction_id"));
        String purchaseOrderId = body.get("purchase_order_id");

        if ((pidx == null || pidx.isBlank()) && (purchaseOrderId == null || purchaseOrderId.isBlank())) {
            return ResponseEntity.badRequest().body("Khalti payment callback data is missing");
        }

        try {
            if (khaltiSecretKey == null || khaltiSecretKey.isBlank()) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Khalti secret key is not configured");
            }

            Map<String, Object> lookupPayload = new HashMap<>();
            if (pidx != null && !pidx.isBlank()) {
                lookupPayload.put("pidx", pidx);
            }

            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(URI.create(khaltiLookupUrl))
                    .header("Authorization", "Key " + khaltiSecretKey)
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(lookupPayload)))
                    .build();

            java.net.http.HttpResponse<String> response = java.net.http.HttpClient.newHttpClient()
                    .send(request, java.net.http.HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Khalti verification failed: " + response.body());
            }

            Map<String, Object> verificationResult = objectMapper.readValue(response.body(), Map.class);
            String status = Objects.toString(verificationResult.get("status"), "");
            String verifiedPurchaseOrderId = Objects.toString(verificationResult.get("purchase_order_id"), "");
            String verifiedPidx = Objects.toString(verificationResult.get("pidx"), "");

            if (!verifiedPurchaseOrderId.isBlank()) {
                purchaseOrderId = verifiedPurchaseOrderId;
            }

            if (purchaseOrderId == null || purchaseOrderId.isBlank()) {
                return ResponseEntity.badRequest().body("Khalti purchase order id missing");
            }

            Payment payment = paymentRepository.findByTransactionUuid(purchaseOrderId)
                    .orElseThrow(() -> new NoSuchElementException("Payment record not found"));

            if (payment.getStatus() != null && payment.getStatus().equalsIgnoreCase("SUCCESS")) {
                return ResponseEntity.badRequest().body("Payment has already been processed");
            }

            if (!("Completed".equalsIgnoreCase(status) || "completed".equalsIgnoreCase(status))) {
                return ResponseEntity.badRequest().body("Payment was not completed successfully");
            }

            if (payment.getAmount() != null && verificationResult.get("total_amount") != null) {
                double verifiedAmount = Double.parseDouble(Objects.toString(verificationResult.get("total_amount"))) / 100.0;
                if (Math.abs(verifiedAmount - payment.getAmount()) > 0.01) {
                    return ResponseEntity.badRequest().body("Payment amount mismatch");
                }
            }

            payment.setStatus("SUCCESS");
            payment.setTransactionId(!verifiedPidx.isBlank() ? verifiedPidx : pidx);
            paymentRepository.save(payment);

            TutorProfile tutorProfile = tutorProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new NoSuchElementException("Tutor profile not found"));

            tutorProfile.setSubscriptionActive(true);
            tutorProfile.setStatus("PENDING");
            tutorProfileRepository.save(tutorProfile);

                user.setVerified(true);
                userRepository.save(user);

            return ResponseEntity.ok(Map.of("message", "Payment successfully verified and profile submitted!", "method", "KHALTI"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Verification error: " + e.getMessage());
        }
    }
}
