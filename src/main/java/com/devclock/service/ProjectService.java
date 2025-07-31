package com.devclock.service;

import com.devclock.model.Project;
import com.devclock.model.TimelineEntry;
import com.devclock.model.User;
import com.devclock.repository.ProjectRepository;
import com.devclock.repository.TimelineEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private TimelineEntryRepository timelineEntryRepository;

    public List<Project> getAllProjects() {
        return projectRepository.findByOrderByCreatedAtDesc();
    }

    public List<Project> getProjectsForUser(User user) {
        List<Project> allProjects = projectRepository.findByOrderByCreatedAtDesc();
        
        if (user.isAdmin()) {
            return allProjects;
        }
        
        return allProjects.stream()
            .filter(project -> 
                (project.getAssignedToAll() != null && project.getAssignedToAll()) ||
                user.getUsername().equals(project.getAssignedUserUsername())
            )
            .collect(java.util.stream.Collectors.toList());
    }

    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    public Project createProject(String name, String description, User user) {
        if (!user.isAdmin()) {
            throw new IllegalArgumentException("Only admin users can create projects");
        }
        
        if (projectRepository.existsByName(name)) {
            throw new IllegalArgumentException("Project with name '" + name + "' already exists");
        }

        Project project = new Project(name, description);
        Project savedProject = projectRepository.save(project);

        createTimelineEntry(savedProject, "PROJECT_CREATED", "Project created", user.getUsername());

        broadcastProjectUpdates();

        return savedProject;
    }

    public void deleteProject(Long projectId, User user) {
        if (!user.isAdmin()) {
            throw new IllegalArgumentException("Only admin users can delete projects");
        }

        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (projectOpt.isPresent()) {
            projectRepository.deleteById(projectId);
            
            broadcastProjectUpdates();
        } else {
            throw new IllegalArgumentException("Project not found");
        }
    }

    public synchronized Project toggleTimer(Long projectId, Project.TimerState newState, String username) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (!projectOpt.isPresent()) {
            throw new IllegalArgumentException("Project not found");
        }

        Project project = projectOpt.get();
        LocalDateTime now = LocalDateTime.now();
        
        if (project.getCurrentState() != Project.TimerState.STOPPED && 
            project.getLastStateChange() != null) {
            
            Duration elapsed = Duration.between(project.getLastStateChange(), now);
            long secondsElapsed = elapsed.getSeconds();

            if (project.getCurrentState() == Project.TimerState.DEV_ACTIVE) {
                project.setDevTimeSeconds(project.getDevTimeSeconds() + secondsElapsed);
                TimelineEntry stopEntry = new TimelineEntry(project, "STOP_DEV", now, "Development work ended", username);
                stopEntry.setDurationSeconds(secondsElapsed);
                timelineEntryRepository.save(stopEntry);
            } else if (project.getCurrentState() == Project.TimerState.WAIT_ACTIVE) {
                project.setWaitTimeSeconds(project.getWaitTimeSeconds() + secondsElapsed);
                TimelineEntry stopEntry = new TimelineEntry(project, "STOP_WAIT", now, "Customer wait ended", username);
                stopEntry.setDurationSeconds(secondsElapsed);
                timelineEntryRepository.save(stopEntry);
            }
        }
        
        project.setCurrentState(newState);
        project.setLastStateChange(now);
        
        Project savedProject = projectRepository.save(project);

        if (newState == Project.TimerState.DEV_ACTIVE) {
            createTimelineEntry(savedProject, "START_DEV", "Development work started", username);
        } else if (newState == Project.TimerState.WAIT_ACTIVE) {
            createTimelineEntry(savedProject, "START_WAIT", "Customer wait started", username);
        } else if (newState == Project.TimerState.STOPPED) {
            createTimelineEntry(savedProject, "TIMER_STOPPED", "All timers stopped", username);
        }

        broadcastProjectUpdates();

        return savedProject;
    }

    public Project stopTimer(Long projectId, String username) {
        return toggleTimer(projectId, Project.TimerState.STOPPED, username);
    }

    public Project startDevTimer(Long projectId, String username) {
        return toggleTimer(projectId, Project.TimerState.DEV_ACTIVE, username);
    }

    public Project startWaitTimer(Long projectId, String username) {
        return toggleTimer(projectId, Project.TimerState.WAIT_ACTIVE, username);
    }

    private void updateElapsedTime(Project project) {
        if (project.getCurrentState() == Project.TimerState.STOPPED || 
            project.getLastStateChange() == null) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        Duration elapsed = Duration.between(project.getLastStateChange(), now);
        long secondsElapsed = elapsed.getSeconds();

        if (project.getCurrentState() == Project.TimerState.DEV_ACTIVE) {
            project.setDevTimeSeconds(project.getDevTimeSeconds() + secondsElapsed);
        } else if (project.getCurrentState() == Project.TimerState.WAIT_ACTIVE) {
            project.setWaitTimeSeconds(project.getWaitTimeSeconds() + secondsElapsed);
        }
        
        project.setLastStateChange(now);
    }

    public synchronized List<Project> updateAllActiveProjects() {
        List<Project> activeProjects = projectRepository.findActiveProjects();
        
        for (Project project : activeProjects) {
            updateElapsedTime(project);
            projectRepository.save(project);
        }
        
        return getAllProjects();
    }

    public List<Project> getProjectsWithCurrentTimes() {
        List<Project> allProjects = getAllProjects();
        LocalDateTime now = LocalDateTime.now();
        
        for (Project project : allProjects) {
            if (project.getCurrentState() != Project.TimerState.STOPPED && 
                project.getLastStateChange() != null) {
                
                Duration elapsed = Duration.between(project.getLastStateChange(), now);
                long secondsElapsed = elapsed.getSeconds();

                if (project.getCurrentState() == Project.TimerState.DEV_ACTIVE) {
                    project.setDevTimeSeconds(project.getDevTimeSeconds() + secondsElapsed);
                } else if (project.getCurrentState() == Project.TimerState.WAIT_ACTIVE) {
                    project.setWaitTimeSeconds(project.getWaitTimeSeconds() + secondsElapsed);
                }
            }
        }
        
        return allProjects;
    }

    public Project assignProjectToUser(Long projectId, String username, User adminUser) {
        if (!adminUser.isAdmin()) {
            throw new IllegalArgumentException("Only admin users can assign projects");
        }

        Optional<Project> projectOpt = getProjectById(projectId);
        if (!projectOpt.isPresent()) {
            throw new IllegalArgumentException("Project not found");
        }

        Project project = projectOpt.get();
        project.setAssignedUserUsername(username);
        project.setAssignedToAll(false);
        project.setUpdatedAt(LocalDateTime.now());
        
        Project savedProject = projectRepository.save(project);
        
        broadcastProjectUpdates();
        
        return savedProject;
    }

    public Project assignProjectToAll(Long projectId, User adminUser) {
        if (!adminUser.isAdmin()) {
            throw new IllegalArgumentException("Only admin users can assign projects");
        }

        Optional<Project> projectOpt = getProjectById(projectId);
        if (!projectOpt.isPresent()) {
            throw new IllegalArgumentException("Project not found");
        }

        Project project = projectOpt.get();
        project.setAssignedUserUsername(null);
        project.setAssignedToAll(true);
        project.setUpdatedAt(LocalDateTime.now());
        
        Project savedProject = projectRepository.save(project);
        
        broadcastProjectUpdates();
        
        return savedProject;
    }

    public Project unassignProject(Long projectId, User adminUser) {
        if (!adminUser.isAdmin()) {
            throw new IllegalArgumentException("Only admin users can unassign projects");
        }

        Optional<Project> projectOpt = getProjectById(projectId);
        if (!projectOpt.isPresent()) {
            throw new IllegalArgumentException("Project not found");
        }

        Project project = projectOpt.get();
        project.setAssignedUserUsername(null);
        project.setAssignedToAll(false);
        project.setUpdatedAt(LocalDateTime.now());
        
        Project savedProject = projectRepository.save(project);
        
        broadcastProjectUpdates();
        
        return savedProject;
    }

    private void createTimelineEntry(Project project, String eventType, String description, String username) {
        System.out.println("Creating timeline entry: " + eventType + " for project " + project.getId() + " by " + username);
        TimelineEntry entry = new TimelineEntry(project, eventType, LocalDateTime.now(), description, username);
        TimelineEntry saved = timelineEntryRepository.save(entry);
        System.out.println("Timeline entry saved with ID: " + saved.getId());
    }

    private void broadcastProjectUpdates() {
        messagingTemplate.convertAndSend("/topic/projects", getAllProjects());
    }
}
