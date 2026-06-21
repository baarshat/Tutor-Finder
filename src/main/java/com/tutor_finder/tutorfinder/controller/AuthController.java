package com.tutor_finder.tutorfinder.controller;

import com.tutor_finder.tutorfinder.dto.LoginRequest;
import com.tutor_finder.tutorfinder.dto.RegisterRequest;
import com.tutor_finder.tutorfinder.model.StudentProfile;
import com.tutor_finder.tutorfinder.model.TutorProfile;
import com.tutor_finder.tutorfinder.model.User;
import com.tutor_finder.tutorfinder.model.Role;
import com.tutor_finder.tutorfinder.repository.StudentProfileRepository;
import com.tutor_finder.tutorfinder.repository.TutorProfileRepository;
import com.tutor_finder.tutorfinder.repository.UserRepository;
import com.tutor_finder.tutorfinder.service.AuthenticationService;
import com.tutor_finder.tutorfinder.service.JwtService;
import com.tutor_finder.tutorfinder.service.RefreshTokenService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final TutorProfileRepository tutorProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(UserRepository userRepository, 
                          TutorProfileRepository tutorProfileRepository, 
                          StudentProfileRepository studentProfileRepository, 
                          PasswordEncoder passwordEncoder,
                          AuthenticationService authenticationService,
                          JwtService jwtService,
                          RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.tutorProfileRepository = tutorProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationService = authenticationService;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
        }
        if (userRepository.existsByPhone(req.getPhone())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Phone number already in use"));
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        if (req.getRole() != null) {
            user.setRole(req.getRole());
        }
        user.setPassword(passwordEncoder.encode(req.getPassword()));

        User savedUser = userRepository.save(user);

        // Create empty profile based on role
        if (Role.TUTOR == req.getRole()) {
            TutorProfile tutorProfile = new TutorProfile();
            tutorProfile.setUser(savedUser);
            tutorProfileRepository.save(tutorProfile);
        } else if (Role.STUDENT == req.getRole() || req.getRole() == null) {
            StudentProfile studentProfile = new StudentProfile();
            studentProfile.setUser(savedUser);
            studentProfileRepository.save(studentProfile);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Optional<User> userOpt = userRepository.findByEmail(req.getEmail());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (passwordEncoder.matches(req.getPassword(), user.getPassword())) {
                var authResponse = authenticationService.authenticate(
                        com.tutor_finder.tutorfinder.dto.AuthenticationRequest.builder()
                                .email(req.getEmail())
                                .password(req.getPassword())
                                .build()
                );

                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("userId", user.getId());
                response.put("name", user.getName());
                response.put("role", user.getRole());
                response.put("verified", user.isVerified());
                response.put("accessToken", authResponse.getAccessToken());
                response.put("refreshToken", authResponse.getRefreshToken());
                response.put("token", authResponse.getAccessToken());
                return ResponseEntity.ok(response);
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        try {
            authenticationService.forgotPassword(email);
            return ResponseEntity.ok(Map.of("message", "OTP sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String newPassword = request.get("newPassword");
        try {
            authenticationService.resetPassword(email, otp, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
