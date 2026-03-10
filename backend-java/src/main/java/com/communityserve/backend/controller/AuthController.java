package com.communityserve.backend.controller;

import com.communityserve.backend.model.User;
import com.communityserve.backend.repository.UserRepository;
import com.communityserve.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    UserRepository userRepository;
    @Autowired
    PasswordEncoder encoder;
    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User is not found."));

        String jwt = jwtUtils.generateJwtToken(user.getEmail(), user.getId(), user.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("token", jwt);
        response.put("user", user);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User signUpRequest) {
        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Username is already taken!"));
        }

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setName(signUpRequest.getName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setRole(signUpRequest.getRole() == null ? "student" : signUpRequest.getRole());
        user.setHoursCompleted(0);
        user.setJoinedAt(Instant.now().toString());

        userRepository.save(user);

        String jwt = jwtUtils.generateJwtToken(user.getEmail(), user.getId(), user.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("token", jwt);
        response.put("user", user);

        return ResponseEntity.ok(response);
    }
}
