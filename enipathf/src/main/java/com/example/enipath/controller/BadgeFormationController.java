package com.example.enipath.controller;

import com.example.enipath.model.AutoFormation.BadgeFormation;
import com.example.enipath.repository.BadgeFormationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/badges-formation")
@CrossOrigin(origins = "http://localhost:4200")
public class BadgeFormationController {

    @Autowired
    private BadgeFormationRepository badgeFormationRepository;

    @GetMapping("/etudiant/{etudiantId}")
    public List<BadgeFormation> getByEtudiant(@PathVariable Long etudiantId) {
        return badgeFormationRepository.findByEtudiantId(etudiantId);
    }

    @PostMapping
    public BadgeFormation create(@RequestBody BadgeFormation badge) {
        return badgeFormationRepository.save(badge);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        badgeFormationRepository.deleteById(id);
    }
}