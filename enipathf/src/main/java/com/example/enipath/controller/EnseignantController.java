package com.example.enipath.controller;

import com.example.enipath.model.Users.Enseignant;
import com.example.enipath.repository.EnseignantRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/enseignants")
public class EnseignantController {

    private final EnseignantRepository repo;
    public EnseignantController(EnseignantRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Enseignant> getAll() { return repo.findAll(); }

    @GetMapping("/{id}")
    public Enseignant getById(@PathVariable Long id) { return repo.findById(id).orElse(null); }

    @PostMapping
    public Enseignant create(@RequestBody Enseignant e) { return repo.save(e); }

    @PutMapping("/{id}")
    public Enseignant update(@PathVariable Long id, @RequestBody Enseignant e) {
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