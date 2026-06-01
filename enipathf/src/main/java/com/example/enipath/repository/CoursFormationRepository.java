package com.example.enipath.repository;

import com.example.enipath.model.AutoFormation.CoursFormation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CoursFormationRepository extends JpaRepository<CoursFormation, Long> {
    List<CoursFormation> findByModuleIdModuleOrderByOrdre(Long moduleId);
}