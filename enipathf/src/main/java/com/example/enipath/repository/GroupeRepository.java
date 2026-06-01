package com.example.enipath.repository;

import com.example.enipath.model.academic.Groupe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupeRepository extends JpaRepository<Groupe, Long> {
    
    Optional<Groupe> findByCodeAndNiveau(Character code, Integer niveau);
    
    List<Groupe> findByNiveau(Integer niveau);
    
    @Query("SELECT g FROM Groupe g WHERE g.nombreEtudiants < g.maxEtudiants ORDER BY g.nombreEtudiants ASC")
    List<Groupe> findGroupesAvailables();
}
