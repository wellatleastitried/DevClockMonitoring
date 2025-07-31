package com.devclock.controller;

import com.devclock.model.Project;
import com.devclock.model.TimelineEntry;
import com.devclock.model.User;
import com.devclock.service.ProjectService;
import com.devclock.service.UserService;
import com.devclock.repository.TimelineEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserService userService;

    @Autowired
    private TimelineEntryRepository timelineEntryRepository;

    @GetMapping
    public ResponseEntity<List<Project>> getAllProjects(@RequestHeader("X-Username") String username) {
        try {
            User user = userService.authenticateUser(username);
            List<Project> projects = projectService.getProjectsForUser(user);
            return ResponseEntity.ok(projects);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProject(@PathVariable Long id) {
        Optional<Project> project = projectService.getProjectById(id);
        return project.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createProject(@Valid @RequestBody CreateProjectRequest request,
                                         @RequestHeader("X-Username") String username) {
        try {
            User user = userService.authenticateUser(username);
            Project project = projectService.createProject(request.getName(), request.getDescription(), user);
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id,
                                         @RequestHeader("X-Username") String username) {
        try {
            User user = userService.authenticateUser(username);
            projectService.deleteProject(id, user);
            Map<String, String> message = new HashMap<>();
            message.put("message", "Project deleted successfully");
            return ResponseEntity.ok(message);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/toggle-dev")
    public ResponseEntity<Project> toggleDevTimer(@PathVariable Long id, @RequestHeader("X-Username") String username) {
        try {
            Project project = projectService.startDevTimer(id, username);
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/toggle-wait")
    public ResponseEntity<Project> toggleWaitTimer(@PathVariable Long id, @RequestHeader("X-Username") String username) {
        try {
            Project project = projectService.startWaitTimer(id, username);
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/stop")
    public ResponseEntity<Project> stopTimer(@PathVariable Long id, @RequestHeader("X-Username") String username) {
        try {
            Project project = projectService.stopTimer(id, username);
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/update-active")
    public ResponseEntity<List<Project>> updateActiveProjects() {
        List<Project> projects = projectService.updateAllActiveProjects();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/current-times")
    public ResponseEntity<List<Project>> getCurrentTimes() {
        List<Project> projects = projectService.getProjectsWithCurrentTimes();
        return ResponseEntity.ok(projects);
    }

    public static class CreateProjectRequest {
        private String name;
        private String description;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<?> assignProject(@PathVariable Long id,
                                         @RequestBody AssignProjectRequest request,
                                         @RequestHeader("X-Username") String username) {
        try {
            User adminUser = userService.authenticateUser(username);
            Project project = projectService.assignProjectToUser(id, request.getUsername(), adminUser);
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/assign-all")
    public ResponseEntity<?> assignProjectToAll(@PathVariable Long id,
                                               @RequestHeader("X-Username") String username) {
        try {
            User adminUser = userService.authenticateUser(username);
            Project project = projectService.assignProjectToAll(id, adminUser);
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/unassign")
    public ResponseEntity<?> unassignProject(@PathVariable Long id,
                                           @RequestHeader("X-Username") String username) {
        try {
            User adminUser = userService.authenticateUser(username);
            Project project = projectService.unassignProject(id, adminUser);
            return ResponseEntity.ok(project);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<List<TimelineEntry>> getProjectTimeline(@PathVariable Long id,
                                                                @RequestHeader("X-Username") String username) {
        try {
            System.out.println("Timeline endpoint called for project " + id + " by user " + username);
            User user = userService.authenticateUser(username);
            
            if (!user.isAdmin()) {
                System.out.println("Access denied - user is not admin");
                return ResponseEntity.status(403).build();
            }
            
            Optional<Project> projectOpt = projectService.getProjectById(id);
            if (!projectOpt.isPresent()) {
                System.out.println("Project not found: " + id);
                return ResponseEntity.notFound().build();
            }
            
            Project project = projectOpt.get();
            
            List<TimelineEntry> timeline = timelineEntryRepository.findByProjectIdOrderByTimestamp(id);
            System.out.println("Found " + timeline.size() + " timeline entries for project " + id);
            
            if (timeline.isEmpty()) {
                System.out.println("No timeline entries found, creating project creation entry");
                TimelineEntry creationEntry = new TimelineEntry(project, "PROJECT_CREATED", 
                    project.getCreatedAt(), "Project created", "system");
                timelineEntryRepository.save(creationEntry);
                timeline = timelineEntryRepository.findByProjectIdOrderByTimestamp(id);
                System.out.println("After creating entry, timeline size: " + timeline.size());
            }
            
            return ResponseEntity.ok(timeline);
        } catch (IllegalArgumentException e) {
            System.out.println("Timeline endpoint error: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    public static class AssignProjectRequest {
        private String username;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }
    }
}
