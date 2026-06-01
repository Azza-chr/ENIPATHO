package com.example.enipath.controller;

import com.example.enipath.model.AutoFormation.Formation;
import com.example.enipath.repository.FormationRepository;
import com.example.enipath.service.FormationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/formations")
@CrossOrigin(origins = "http://localhost:4200")
public class FormationController {

    @Autowired
    private FormationRepository formationRepository;

    @Autowired
    private FormationService formationService;

    @GetMapping
    public List<Formation> getAll() {
        return formationRepository.findAll();
    }

    @GetMapping("/{id}")
    public Formation getById(@PathVariable Long id) {
        return formationRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Formation create(@RequestBody Formation formation) {
        return formationRepository.save(formation);
    }

    @PutMapping("/{id}")
    public Formation update(@PathVariable Long id, @RequestBody Formation formation) {
        formation.setIdFormation(id);
        return formationRepository.save(formation);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        formationRepository.deleteById(id);
    }
}