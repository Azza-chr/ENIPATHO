package com.example.enipath.repository;

import com.example.enipath.model.Users.Enseignant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EnseignantRepository extends JpaRepository<Enseignant, Long> {

    // Derived queries — course page 57
    List<Enseignant> findByDepartement(String departement);

    List<Enseignant> findBySpecialite(String specialite);

    // JPQL with @Param — course page 62
    @Query("SELECT e FROM Enseignant e WHERE e.departement = :dept AND e.specialite = :spec")
    List<Enseignant> findByDepartementAndSpecialite(@Param("dept") String dept,
                                                    @Param("spec") String spec);
}