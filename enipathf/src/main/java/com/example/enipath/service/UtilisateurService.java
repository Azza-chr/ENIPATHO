package com.example.enipath.service;

import com.example.enipath.model.Users.Utilisateur;
import java.util.List;
import java.util.Optional;

public interface UtilisateurService {

    Optional<Utilisateur> findByEmail(String email);
    boolean emailExists(String email);
    List<Utilisateur> findAll();
    List<Utilisateur> findByActif(Boolean actif);
    void toggleActif(Long id);
    void changerMotDePasse(Long id, String ancienMdp, String nouveauMdp);
    boolean verifierMotDePasse(String rawMdp, String hashedMdp);
    void delete(Long id);
}
