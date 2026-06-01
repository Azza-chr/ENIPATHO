package com.example.enipath.service.implementation;

import com.example.enipath.model.Users.Utilisateur;
import com.example.enipath.repository.UtilisateurRepository;
import com.example.enipath.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UtilisateurServiceImpl implements UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Optional<Utilisateur> findByEmail(String email) {
        return utilisateurRepository.findByEmail(email);
    }

    @Override
    public boolean emailExists(String email) {
        return utilisateurRepository.existsByEmail(email);
    }

    @Override
    public List<Utilisateur> findAll() {
        return utilisateurRepository.findAll();
    }

    @Override
    public List<Utilisateur> findByActif(Boolean actif) {
        return utilisateurRepository.findByActif(actif);
    }

    @Override
    @Transactional
    public void toggleActif(Long id) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + id));
        utilisateurRepository.updateActif(id, !u.getActif());
    }

    @Override
    public boolean verifierMotDePasse(String rawMdp, String hashedMdp) {
        return passwordEncoder.matches(rawMdp, hashedMdp);
    }

    @Override
    @Transactional
    public void changerMotDePasse(Long id, String ancienMdp, String nouveauMdp) {
        Utilisateur u = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + id));
        if (!passwordEncoder.matches(ancienMdp, u.getMdp())) {
            throw new RuntimeException("Ancien mot de passe incorrect");
        }
        utilisateurRepository.updatePassword(id, passwordEncoder.encode(nouveauMdp));
    }

    @Override
    public void delete(Long id) {
        utilisateurRepository.deleteById(id);
    }
}
