package com.devclock.model;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Project name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Description is required")
    @Column(nullable = false, length = 1000)
    private String description;

    @NotNull
    @Column(name = "dev_time_seconds", nullable = false)
    private Long devTimeSeconds = 0L;

    @NotNull
    @Column(name = "wait_time_seconds", nullable = false)
    private Long waitTimeSeconds = 0L;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_state")
    private TimerState currentState = TimerState.STOPPED;

    @Column(name = "last_state_change")
    private LocalDateTime lastStateChange;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "assigned_user_username")
    private String assignedUserUsername;

    @Column(name = "assigned_to_all", nullable = false)
    private Boolean assignedToAll = false;

    public enum TimerState {
        STOPPED, DEV_ACTIVE, WAIT_ACTIVE
    }

    public Project() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Project(String name, String description) {
        this();
        this.name = name;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        this.updatedAt = LocalDateTime.now();
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getDevTimeSeconds() {
        return devTimeSeconds;
    }

    public void setDevTimeSeconds(Long devTimeSeconds) {
        this.devTimeSeconds = devTimeSeconds;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getWaitTimeSeconds() {
        return waitTimeSeconds;
    }

    public void setWaitTimeSeconds(Long waitTimeSeconds) {
        this.waitTimeSeconds = waitTimeSeconds;
        this.updatedAt = LocalDateTime.now();
    }

    public TimerState getCurrentState() {
        return currentState;
    }

    public void setCurrentState(TimerState currentState) {
        this.currentState = currentState;
        this.lastStateChange = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getLastStateChange() {
        return lastStateChange;
    }

    public void setLastStateChange(LocalDateTime lastStateChange) {
        this.lastStateChange = lastStateChange;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getAssignedUserUsername() {
        return assignedUserUsername;
    }

    public void setAssignedUserUsername(String assignedUserUsername) {
        this.assignedUserUsername = assignedUserUsername;
    }

    public Boolean getAssignedToAll() {
        return assignedToAll;
    }

    public void setAssignedToAll(Boolean assignedToAll) {
        this.assignedToAll = assignedToAll;
    }
}
