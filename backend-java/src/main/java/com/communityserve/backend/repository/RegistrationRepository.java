package com.communityserve.backend.repository;

import com.communityserve.backend.model.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends JpaRepository<Registration, String> {
    List<Registration> findByEventId(String eventId);
    Optional<Registration> findByEventIdAndUserId(String eventId, String userId);
}
