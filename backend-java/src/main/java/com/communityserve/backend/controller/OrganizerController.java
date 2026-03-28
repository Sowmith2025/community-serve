package com.communityserve.backend.controller;

import com.communityserve.backend.model.Event;
import com.communityserve.backend.model.Registration;
import com.communityserve.backend.repository.EventRepository;
import com.communityserve.backend.repository.RegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/organizer")
public class OrganizerController {

    @Autowired
    EventRepository eventRepository;

    @Autowired
    RegistrationRepository registrationRepository;

    /**
     * GET /api/organizer/stats?organizerId={id}
     *
     * Returns aggregated statistics for a specific organizer.
     * Used by the Dashboard's AI Insights panel.
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getOrganizerStats(@RequestParam String organizerId) {
        // Fetch all events created by this organizer (efficient JPA derived query)
        List<Event> events = eventRepository.findByOrganizerId(organizerId);

        int totalEvents = events.size();
        int totalRegistrations = 0;
        int totalCapacity = 0;
        String topEventName = "N/A";
        int topEventCount = 0;

        // Category breakdown map
        Map<String, Integer> categories = new LinkedHashMap<>();

        for (Event event : events) {
            List<Registration> regs = registrationRepository.findByEventId(event.getId());
            int count = regs.size();
            totalRegistrations += count;
            totalCapacity += event.getMaxVolunteers();

            if (count > topEventCount) {
                topEventCount = count;
                topEventName = event.getTitle();
            }

            String cat = event.getCategory() != null ? event.getCategory() : "general";
            categories.merge(cat, 1, Integer::sum);
        }

        double avgFillRate = (totalCapacity > 0)
                ? Math.round((totalRegistrations * 100.0 / totalCapacity) * 10.0) / 10.0
                : 0.0;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalEvents", totalEvents);
        result.put("totalRegistrations", totalRegistrations);
        result.put("topEvent", topEventName);
        result.put("categories", categories);
        result.put("avgFillRate", avgFillRate);

        return ResponseEntity.ok(result);
    }
}
