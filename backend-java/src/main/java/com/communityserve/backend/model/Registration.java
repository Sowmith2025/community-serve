package com.communityserve.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "registrations")
public class Registration {
    @Id
    private String id;
    
    private String eventId;
    private String userId;
    private String registeredAt;
    private String status;
}
