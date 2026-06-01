package com.example.enipath.service;

import com.example.enipath.model.Users.Etudiant;
import java.util.List;
import java.util.Optional;

public interface EtudiantService {

    Etudiant save(Etudiant etudiant);
    Optional<Etudiant> findById(Long id);
    List<Etudiant> findAll();
    List<Etudiant> findByNiveau(Integer niveau);
    List<Etudiant> getLeaderboard();
    void addBadge(Long id);
    void updateScore(Long id, int points);
    void delete(Long id);
}
