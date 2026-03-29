package com.communityserve.backend.repository;

import com.communityserve.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    List<User> findTop10ByRoleOrderByHoursCompletedDesc(String role);
}
