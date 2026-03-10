package com.communityserve.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "events")
public class Event {
    @Id
    private String id;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String date;
    private String time;
    private String location;
    private int maxVolunteers;
    private String organizerId;
    private String category;
    private String status;
    private String createdAt;
}
