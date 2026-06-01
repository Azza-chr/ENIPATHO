package com.example.enipath.repository;

import com.example.enipath.model.AutoFormation.ModuleFormation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ModuleFormationRepository extends JpaRepository<ModuleFormation, Long> {

    @Query("SELECT m FROM ModuleFormation m WHERE m.formation.idFormation = :formationId ORDER BY m.ordre")
    List<ModuleFormation> findByFormationIdFormationOrderByOrdre(@Param("formationId") Long formationId);
}