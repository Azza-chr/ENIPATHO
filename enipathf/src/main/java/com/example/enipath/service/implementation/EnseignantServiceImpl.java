package com.example.enipath.service.implementation;

import com.example.enipath.model.Users.Enseignant;
import com.example.enipath.repository.EnseignantRepository;
import com.example.enipath.service.EnseignantService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EnseignantServiceImpl implements EnseignantService {

    private final EnseignantRepository enseignantRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Enseignant save(Enseignant enseignant) {
        enseignant.setMdp(passwordEncoder.encode(enseignant.getMdp()));
        enseignant.setActif(true);
        return enseignantRepository.save(enseignant);
    }

    @Override
    public Optional<Enseignant> findById(Long id) {
        return enseignantRepository.findById(id);
    }

    @Override
    public List<Enseignant> findAll() {
        return enseignantRepository.findAll();
    }

    @Override
    public List<Enseignant> findByDepartement(String departement) {
        return enseignantRepository.findByDepartement(departement);
    }

    @Override
    public List<Enseignant> findBySpecialite(String specialite) {
        return enseignantRepository.findBySpecialite(specialite);
    }

    @Override
    public void delete(Long id) {
        enseignantRepository.deleteById(id);
    }
}
