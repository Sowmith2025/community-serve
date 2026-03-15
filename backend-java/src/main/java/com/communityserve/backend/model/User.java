package com.communityserve.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    private String id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;
    private String role;
    private String phone;
    private String department;
    private Integer hoursCompleted = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_events", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "event_id")
    @OrderColumn(name = "event_order")
    private List<String> eventsAttended = new ArrayList<>();

    private String joinedAt;
}
