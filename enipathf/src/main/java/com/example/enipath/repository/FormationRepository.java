package com.example.enipath.repository;

import com.example.enipath.model.AutoFormation.Formation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FormationRepository extends JpaRepository<Formation, Long> {
}