package com.communityserve.backend.config;

import com.communityserve.backend.model.Event;
import com.communityserve.backend.model.User;
import com.communityserve.backend.repository.EventRepository;
import com.communityserve.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DBSeeder implements CommandLineRunner {
    @Autowired UserRepository userRepository;
    @Autowired EventRepository eventRepository;
    @Autowired PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User student = new User();
            student.setId("user-1");
            student.setName("Arjun Kumar");
            student.setEmail("arjun@college.edu");
            student.setPassword(encoder.encode("password"));
            student.setRole("student");
            userRepository.save(student);

            User organizer = new User();
            organizer.setId("user-2");
            organizer.setName("Priya Sharma");
            organizer.setEmail("priya@college.edu");
            organizer.setPassword(encoder.encode("password"));
            organizer.setRole("organizer");
            userRepository.save(organizer);
        }

        if (eventRepository.count() == 0) {
            Event event1 = new Event("event-1", "Hussain Sagar Lake Cleanup", "Swachhata drive to remove litter along the lakeside.", "2025-10-18", "09:00", "Necklace Road, Hyderabad", 25, "user-2", "environment", "upcoming", "2025-09-20T00:00:00.000Z");
            Event event2 = new Event("event-2", "Annadanam Food Distribution", "Collect, pack and distribute meal packets.", "2025-11-02", "13:00", "Community Hall, Secunderabad", 30, "user-1", "community", "upcoming", "2025-09-25T00:00:00.000Z");
            eventRepository.save(event1);
            eventRepository.save(event2);
        }
    }
}
