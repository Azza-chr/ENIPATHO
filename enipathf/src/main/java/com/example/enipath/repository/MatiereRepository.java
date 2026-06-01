package com.example.enipath.repository;

import com.example.enipath.model.academic.Matiere;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@org.springframework.stereotype.Repository("academicMatiereRepository")
public interface MatiereRepository extends JpaRepository<Matiere, Long> {

    List<Matiere> findBySemestreIdOrderByNomAsc(Long semestreId);
}
