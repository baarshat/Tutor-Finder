package com.tutor_finder.tutorfinder.controller;

import com.tutor_finder.tutorfinder.model.User;
import com.tutor_finder.tutorfinder.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    Map<String, Object> summary = new HashMap<>();
                    summary.put("id", user.getId());
                    summary.put("name", user.getName());
                    summary.put("email", user.getEmail());
                    summary.put("phone", user.getPhone());
                    summary.put("role", user.getRole());
                    summary.put("profilePicUrl", user.getProfilePicUrl());
                    summary.put("verified", user.isVerified());
                    return ResponseEntity.ok(summary);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return userRepository.findById(id)
                .map(user -> {
                    String name = body.get("name");
                    String email = body.get("email");
                    String phone = body.get("phone");
                    String profilePicUrl = body.get("profilePicUrl");

                    if (name != null) user.setName(name);
                    if (email != null) {
                        if (!email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
                            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use"));
                        }
                        user.setEmail(email);
                    }
                    if (phone != null) {
                        if (!phone.equals(user.getPhone()) && userRepository.existsByPhone(phone)) {
                            return ResponseEntity.badRequest().body(Map.of("message", "Phone number already in use"));
                        }
                        user.setPhone(phone);
                    }
                    if (profilePicUrl != null) user.setProfilePicUrl(profilePicUrl);

                    User updated = userRepository.save(user);

                    Map<String, Object> summary = new HashMap<>();
                    summary.put("id", updated.getId());
                    summary.put("name", updated.getName());
                    summary.put("email", updated.getEmail());
                    summary.put("phone", updated.getPhone());
                    summary.put("role", updated.getRole());
                    summary.put("profilePicUrl", updated.getProfilePicUrl());
                    summary.put("verified", updated.isVerified());
                    return ResponseEntity.ok(summary);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");

        if (oldPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
        }

        return userRepository.findById(id)
                .map(user -> {
                    if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("message", "Incorrect current password"));
                    }
                    user.setPassword(passwordEncoder.encode(newPassword));
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
