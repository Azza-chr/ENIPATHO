package com.example.enipath.repository;

import com.example.enipath.model.communication.StudentNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentNotificationRepository extends JpaRepository<StudentNotification, Long> {
    List<StudentNotification> findTop10ByEtudiantIdOrderByCreatedAtDesc(Long etudiantId);
    long countByEtudiantId(Long etudiantId);
}
