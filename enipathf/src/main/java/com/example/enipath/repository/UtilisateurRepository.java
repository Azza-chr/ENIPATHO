package com.example.enipath.repository;


import com.example.enipath.model.Users.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    // Derived query (no keyword) — course page 57
    Optional<Utilisateur> findByEmail(String email);

    boolean existsByEmail(String email);

    // JPQL query — course page 62
    @Query("SELECT u FROM Utilisateur u WHERE u.actif = :actif")
    java.util.List<Utilisateur> findByActif(@Param("actif") Boolean actif);

    // JPQL update — course page 63
    @Modifying
    @Query("UPDATE Utilisateur u SET u.actif = :actif WHERE u.id = :id")
    int updateActif(@Param("id") Long id, @Param("actif") Boolean actif);

    // JPQL update for password — course page 63
    @Modifying
    @Query("UPDATE Utilisateur u SET u.mdp = :mdp WHERE u.id = :id")
    int updatePassword(@Param("id") Long id, @Param("mdp") String mdp);
}