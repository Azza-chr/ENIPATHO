package com.example.enipath.controller;

import com.example.enipath.model.Users.Etudiant;
import com.example.enipath.repository.EtudiantRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/etudiants")
public class EtudiantController {

    private final EtudiantRepository repo;
    public EtudiantController(EtudiantRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Etudiant> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Etudiant getById(@PathVariable Long id) { return repo.findById(id).orElse(null); }

    @PostMapping
    public Etudiant create(@RequestBody Etudiant e) { return repo.save(e); }

    @PutMapping("/{id}")
    public Etudiant update(@PathVariable Long id, @RequestBody Etudiant e) {
        return repo.findById(id).map(existing -> {
            existing.setNom(e.getNom());
            existing.setPrenom(e.getPrenom());
            existing.setEmail(e.getEmail());
            return repo.save(existing);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { repo.deleteById(id); }
}