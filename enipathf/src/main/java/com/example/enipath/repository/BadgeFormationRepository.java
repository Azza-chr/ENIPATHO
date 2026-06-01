package com.example.enipath.repository;

import com.example.enipath.model.AutoFormation.BadgeFormation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BadgeFormationRepository extends JpaRepository<BadgeFormation, Long> {
    List<BadgeFormation> findByEtudiantId(Long etudiantId);
}