package com.example.enipath.repository;

import com.example.enipath.model.AutoFormation.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CertificationRepository extends JpaRepository<Certification, Long> {
    List<Certification> findByEtudiantId(Long etudiantId);
}