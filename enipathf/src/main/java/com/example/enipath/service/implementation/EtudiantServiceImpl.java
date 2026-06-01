package com.example.enipath.service.implementation;

import com.example.enipath.model.Users.Etudiant;
import com.example.enipath.repository.EtudiantRepository;
import com.example.enipath.service.EtudiantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EtudiantServiceImpl implements EtudiantService {

    private final EtudiantRepository etudiantRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Etudiant save(Etudiant etudiant) {
        // Hash password before persisting — security rule
        etudiant.setMdp(passwordEncoder.encode(etudiant.getMdp()));
        etudiant.setActif(true);       // active by default
        etudiant.setScore(0);
        etudiant.setTotalBadges(0);
        return etudiantRepository.save(etudiant);
    }

    @Override
    public Optional<Etudiant> findById(Long id) {
        return etudiantRepository.findById(id);
    }

    @Override
    public List<Etudiant> findAll() {
        return etudiantRepository.findAll();
    }

    @Override
    public List<Etudiant> findByNiveau(Integer niveau) {
        return etudiantRepository.findByNiveau(niveau);
    }

    @Override
    public List<Etudiant> getLeaderboard() {
        return etudiantRepository.findByOrderByScoreDesc();
    }

    @Override
    public void addBadge(Long id) {
        Etudiant e = etudiantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Etudiant non trouvé: " + id));
        e.setTotalBadges(e.getTotalBadges() + 1);
        etudiantRepository.save(e);
    }

    @Override
    public void updateScore(Long id, int points) {
        Etudiant e = etudiantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Etudiant non trouvé: " + id));
        e.setScore(e.getScore() + points);
        etudiantRepository.save(e);
    }

    @Override
    public void delete(Long id) {
        etudiantRepository.deleteById(id);
    }
}
