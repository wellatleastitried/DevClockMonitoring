package com.devclock.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "timeline_entries")
public class TimelineEntry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore  // Prevent circular reference during JSON serialization
    private Project project;
    
    @Column(name = "project_id", insertable = false, updatable = false)
    private Long projectId;  // Add this for JSON response
    
    @Column(nullable = false)
    private String eventType; // "START_DEV", "STOP_DEV", "START_WAIT", "STOP_WAIT", "PROJECT_CREATED"
    
    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime timestamp;
    
    @Column
    private String description;
    
    @Column
    private Long durationSeconds; // Duration of the session that ended (for STOP events)
    
    @Column
    private String username; // User who performed the action
    
    public TimelineEntry() {}
    
    public TimelineEntry(Project project, String eventType, LocalDateTime timestamp, String description, String username) {
        this.project = project;
        this.eventType = eventType;
        this.timestamp = timestamp;
        this.description = description;
        this.username = username;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Project getProject() {
        return project;
    }
    
    public void setProject(Project project) {
        this.project = project;
        this.projectId = project != null ? project.getId() : null;
    }
    
    public Long getProjectId() {
        return projectId;
    }
    
    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }
    
    public String getEventType() {
        return eventType;
    }
    
    public void setEventType(String eventType) {
        this.eventType = eventType;
    }
    
    public LocalDateTime getTimestamp() {
        return timestamp;
    }
    
    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Long getDurationSeconds() {
        return durationSeconds;
    }
    
    public void setDurationSeconds(Long durationSeconds) {
        this.durationSeconds = durationSeconds;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
}
