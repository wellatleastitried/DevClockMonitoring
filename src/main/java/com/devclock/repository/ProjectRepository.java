package com.devclock.repository;

import com.devclock.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    List<Project> findByOrderByCreatedAtDesc();
    
    @Query("SELECT p FROM Project p WHERE p.currentState != 'STOPPED'")
    List<Project> findActiveProjects();
    
    boolean existsByName(String name);
}
