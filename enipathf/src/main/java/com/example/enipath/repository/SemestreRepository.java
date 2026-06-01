package com.example.enipath.repository;

import com.example.enipath.model.academic.Semestre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@org.springframework.stereotype.Repository("academicSemestreRepository")
public interface SemestreRepository extends JpaRepository<Semestre, Long> {

    List<Semestre> findAllByOrderByOrdreAsc();
}
