package com.example.enipath.repository;

import com.example.enipath.model.communication.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findTop10ByOrderByCreatedAtDesc();
    List<Announcement> findAllByOrderByCreatedAtDesc();
    long countByEnseignantId(Long enseignantId);
}
