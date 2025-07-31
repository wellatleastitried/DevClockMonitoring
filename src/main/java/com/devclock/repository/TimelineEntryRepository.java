package com.devclock.repository;

import com.devclock.model.TimelineEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimelineEntryRepository extends JpaRepository<TimelineEntry, Long> {
    
    @Query("SELECT t FROM TimelineEntry t WHERE t.project.id = :projectId ORDER BY t.timestamp ASC")
    List<TimelineEntry> findByProjectIdOrderByTimestamp(@Param("projectId") Long projectId);
}
