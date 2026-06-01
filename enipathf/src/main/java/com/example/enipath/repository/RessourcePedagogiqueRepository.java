package com.example.enipath.repository;

import com.example.enipath.model.academic.RessourcePedagogique;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@org.springframework.stereotype.Repository("academicRessourcePedagogiqueRepository")
public interface RessourcePedagogiqueRepository extends JpaRepository<RessourcePedagogique, Long> {

    List<RessourcePedagogique> findByChapitreIdOrderByIdAsc(Long chapitreId);
}
