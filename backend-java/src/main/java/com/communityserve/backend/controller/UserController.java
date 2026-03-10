package com.communityserve.backend.controller;

import com.communityserve.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable String id) {
        return userRepository.findById(id)
            .map(u -> ResponseEntity.ok(Map.of("data", u)))
            .orElseGet(() -> ResponseEntity.status(404).body((Map)Map.of("message", "User not found")));
    }
}
