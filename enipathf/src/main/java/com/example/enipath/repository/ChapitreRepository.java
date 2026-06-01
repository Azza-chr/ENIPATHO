package com.example.enipath.repository;

import com.example.enipath.model.academic.Chapitre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Repository("academicChapitreRepository")
public interface ChapitreRepository extends JpaRepository<Chapitre, Long> {

    List<Chapitre> findByMatiereIdOrderByOrdreAsc(Long matiereId);

    Optional<Chapitre> findByIdAndMatiereId(Long chapitreId, Long matiereId);
}
