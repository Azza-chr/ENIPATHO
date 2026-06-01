package com.example.enipath.controller;

import com.example.enipath.model.AutoFormation.CoursFormation;
import com.example.enipath.repository.CoursFormationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cours-formation")
@CrossOrigin(origins = "http://localhost:4200")
public class CoursFormationController {

    @Autowired
    private CoursFormationRepository coursFormationRepository;

    @GetMapping("/module/{moduleId}")
    public List<CoursFormation> getByModule(@PathVariable Long moduleId) {
        return coursFormationRepository.findByModuleIdModuleOrderByOrdre(moduleId);
    }

    @GetMapping("/{id}")
    public CoursFormation getById(@PathVariable Long id) {
        return coursFormationRepository.findById(id).orElse(null);
    }

    @PostMapping
    public CoursFormation create(@RequestBody CoursFormation cours) {
        return coursFormationRepository.save(cours);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        coursFormationRepository.deleteById(id);
    }
}