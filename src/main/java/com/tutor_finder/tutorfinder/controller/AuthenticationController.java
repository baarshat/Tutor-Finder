package com.tutor_finder.tutorfinder.controller;

import com.tutor_finder.tutorfinder.dto.AuthenticationRequest;
import com.tutor_finder.tutorfinder.dto.AuthenticationResponse;
import com.tutor_finder.tutorfinder.dto.RefreshTokenRequest;
import com.tutor_finder.tutorfinder.dto.RegisterRequest;
import com.tutor_finder.tutorfinder.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        AuthenticationResponse response = service.authenticate(request);
        return ResponseEntity.ok()
                .header("Set-Cookie", createJwtCookie(response.getAccessToken()))
                .body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthenticationResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(service.refreshToken(request));
    }

    private String createJwtCookie(String token) {
        return String.format(
                "jwt-token=%s; Path=/; HttpOnly; SameSite=Lax; Max-Age=%d",
                token,
                86400 // 24 hours
        );
    }
}
