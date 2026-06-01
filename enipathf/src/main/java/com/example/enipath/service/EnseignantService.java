package com.example.enipath.service;

import com.example.enipath.model.Users.Enseignant;
import java.util.List;
import java.util.Optional;

public interface EnseignantService {

    Enseignant save(Enseignant enseignant);
    Optional<Enseignant> findById(Long id);
    List<Enseignant> findAll();
    List<Enseignant> findByDepartement(String departement);
    List<Enseignant> findBySpecialite(String specialite);
    void delete(Long id);
}
