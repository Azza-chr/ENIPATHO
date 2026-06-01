package com.example.enipath.repository;

import com.example.enipath.model.Users.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {

    // Find by niveau (Integer)
    List<Etudiant> findByNiveau(Integer niveau);
    
    // Find by groupe
    List<Etudiant> findByGroupe(Character groupe);
    
    // Find by niveau and groupe
    List<Etudiant> findByNiveauAndGroupe(Integer niveau, Character groupe);

    // Find by score greater than or equal
    List<Etudiant> findByScoreGreaterThanEqual(int minScore);

    // Order by score descending
    List<Etudiant> findByOrderByScoreDesc();

    // JPQL — Find top students by niveau
    @Query("SELECT e FROM Etudiant e WHERE e.niveau = :niveau ORDER BY e.score DESC")
    List<Etudiant> findTopByNiveau(@Param("niveau") Integer niveau);
    
    // Count students by groupe and niveau
    @Query("SELECT COUNT(e) FROM Etudiant e WHERE e.groupe = :groupe AND e.niveau = :niveau")
    int countByGroupeAndNiveau(@Param("groupe") Character groupe, @Param("niveau") Integer niveau);
    
    // Find all by groupe and niveau (with order)
    @Query("SELECT e FROM Etudiant e WHERE e.groupe = :groupe AND e.niveau = :niveau ORDER BY e.score DESC")
    List<Etudiant> findStudentsByGroupeAndNiveau(@Param("groupe") Character groupe, @Param("niveau") Integer niveau);

    // Find all students for a specific teacher
    List<Etudiant> findByEnseignants_Id(Long enseignantId);
}