package com.communityserve.backend.controller;

import com.communityserve.backend.model.Event;
import com.communityserve.backend.model.Registration;
import com.communityserve.backend.model.User;
import com.communityserve.backend.repository.EventRepository;
import com.communityserve.backend.repository.RegistrationRepository;
import com.communityserve.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/events")
public class EventController {
    @Autowired
    EventRepository eventRepository;
    @Autowired
    RegistrationRepository registrationRepository;
    @Autowired
    UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        List<Map<String, Object>> response = new ArrayList<>();

        for (Event event : events) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", event.getId());
            map.put("title", event.getTitle());
            map.put("description", event.getDescription());
            map.put("date", event.getDate());
            map.put("time", event.getTime());
            map.put("location", event.getLocation());
            map.put("maxVolunteers", event.getMaxVolunteers());
            map.put("category", event.getCategory());

            User org = userRepository.findById(event.getOrganizerId() != null ? event.getOrganizerId() : "")
                    .orElse(null);
            map.put("organizer", org != null ? org.getName() : "Unknown");

            int count = registrationRepository.findByEventId(event.getId()).size();
            map.put("registeredCount", count);
            map.put("isFull", count >= event.getMaxVolunteers());
            response.add(map);
        }
        return ResponseEntity.ok(Map.of("data", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEventById(@PathVariable String id) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Event not found"));
        }
        Event event = eventOpt.get();
        List<Registration> regs = registrationRepository.findByEventId(id);

        Map<String, Object> data = new HashMap<>();
        data.put("id", event.getId());
        data.put("title", event.getTitle());
        data.put("description", event.getDescription());
        data.put("date", event.getDate());
        data.put("time", event.getTime());
        data.put("location", event.getLocation());
        data.put("maxVolunteers", event.getMaxVolunteers());
        data.put("category", event.getCategory());

        User org = userRepository.findById(event.getOrganizerId() != null ? event.getOrganizerId() : "").orElse(null);
        data.put("organizer", org);

        List<Map<String, Object>> users = new ArrayList<>();
        for (Registration r : regs) {
            userRepository.findById(r.getUserId()).ifPresent(u -> {
                Map<String, Object> uMap = new HashMap<>();
                uMap.put("id", u.getId());
                uMap.put("name", u.getName());
                uMap.put("email", u.getEmail());
                uMap.put("role", u.getRole());
                uMap.put("registeredAt", r.getRegisteredAt());
                uMap.put("rating", r.getRating());
                uMap.put("feedback", r.getFeedback());
                users.add(uMap);
            });
        }

        data.put("registeredUsers", users);
        data.put("registeredCount", regs.size());
        data.put("isFull", regs.size() >= event.getMaxVolunteers());

        return ResponseEntity.ok(Map.of("data", data));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<?> registerForEvent(@PathVariable String id, @RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("message", "Event not found"));

        if (registrationRepository.findByEventIdAndUserId(id, userId).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Already registered for this event"));
        }

        List<Registration> regs = registrationRepository.findByEventId(id);
        if (regs.size() >= eventOpt.get().getMaxVolunteers()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Event is full"));
        }

        Registration r = new Registration();
        r.setId(UUID.randomUUID().toString());
        r.setEventId(id);
        r.setUserId(userId);
        r.setRegisteredAt(Instant.now().toString());
        r.setStatus("registered");
        registrationRepository.save(r);

        userRepository.findById(userId).ifPresent(user -> {
            if (!user.getEventsAttended().contains(id)) {
                user.getEventsAttended().add(id);
                userRepository.save(user);
            }
        });

        return ResponseEntity.ok(Map.of("message", "Successfully registered for event", "registration", r));
    }

    @DeleteMapping("/{id}/register/{userId}")
    public ResponseEntity<?> unregisterForEvent(@PathVariable String id, @PathVariable String userId) {
        Optional<Event> eventOpt = eventRepository.findById(id);
        if (eventOpt.isEmpty())
            return ResponseEntity.status(404).body(Map.of("message", "Event not found"));

        Optional<Registration> regOpt = registrationRepository.findByEventIdAndUserId(id, userId);
        if (regOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Not registered for this event"));
        }

        registrationRepository.delete(regOpt.get());

        userRepository.findById(userId).ifPresent(user -> {
            user.getEventsAttended().remove(id);
            userRepository.save(user);
        });

        return ResponseEntity.ok(Map.of("message", "Successfully unregistered from event"));
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<?> submitFeedback(@PathVariable String id, @RequestBody Map<String, Object> body) {
        String userId = (String) body.get("userId");
        Integer rating = (Integer) body.get("rating");
        String feedback = (String) body.get("feedback");

        Optional<Registration> regOpt = registrationRepository.findByEventIdAndUserId(id, userId);
        if (regOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Registration not found"));
        }
        Registration r = regOpt.get();
        if (rating != null) r.setRating(rating);
        if (feedback != null) r.setFeedback(feedback);
        registrationRepository.save(r);

        return ResponseEntity.ok(Map.of("message", "Feedback submitted successfully"));
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        event.setId(UUID.randomUUID().toString());
        event.setCreatedAt(Instant.now().toString());
        event.setStatus("upcoming");
        if (event.getMaxVolunteers() == 0)
            event.setMaxVolunteers(20);
        if (event.getCategory() == null)
            event.setCategory("general");
        eventRepository.save(event);
        return ResponseEntity.status(201).body(Map.of("message", "Event created successfully", "event", event));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateEvent(@PathVariable String id, @RequestBody Event updatedEvent) {
        Optional<Event> existingOpt = eventRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Event not found"));
        }
        Event existing = existingOpt.get();
        if (updatedEvent.getTitle() != null)
            existing.setTitle(updatedEvent.getTitle());
        if (updatedEvent.getDescription() != null)
            existing.setDescription(updatedEvent.getDescription());
        if (updatedEvent.getDate() != null)
            existing.setDate(updatedEvent.getDate());
        if (updatedEvent.getTime() != null)
            existing.setTime(updatedEvent.getTime());
        if (updatedEvent.getLocation() != null)
            existing.setLocation(updatedEvent.getLocation());
        if (updatedEvent.getMaxVolunteers() > 0)
            existing.setMaxVolunteers(updatedEvent.getMaxVolunteers());
        if (updatedEvent.getCategory() != null)
            existing.setCategory(updatedEvent.getCategory());

        eventRepository.save(existing);
        return ResponseEntity.ok(Map.of("message", "Event updated successfully", "event", existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable String id) {
        if (!eventRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("message", "Event not found"));
        }
        // Also delete registrations for this event
        List<Registration> regs = registrationRepository.findByEventId(id);
        registrationRepository.deleteAll(regs);

        eventRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Event deleted successfully"));
    }
}
