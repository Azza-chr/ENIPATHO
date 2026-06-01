package com.example.enipath.controller;

import com.example.enipath.model.AutoFormation.ModuleFormation;
import com.example.enipath.repository.ModuleFormationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/modules")
@CrossOrigin(origins = "http://localhost:4200")
public class ModuleFormationController {

    @Autowired
    private ModuleFormationRepository moduleFormationRepository;

    @GetMapping
    public List<ModuleFormation> getAll() { return moduleFormationRepository.findAll(); }

    @GetMapping("/{id}")
    public ModuleFormation getById(@PathVariable Long id) {
        return moduleFormationRepository.findById(id).orElse(null);
    }

    @GetMapping("/formation/{formationId}")
    public List<ModuleFormation> getByFormation(@PathVariable Long formationId) {
        return moduleFormationRepository.findByFormationIdFormationOrderByOrdre(formationId);
    }

    @PostMapping
    public ModuleFormation create(@RequestBody ModuleFormation module) {
        return moduleFormationRepository.save(module);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        moduleFormationRepository.deleteById(id);
    }
    @PutMapping("/{id}")
    public ModuleFormation update(@PathVariable Long id, @RequestBody ModuleFormation module) {
        module.setIdModule(id);
        return moduleFormationRepository.save(module);
    }
}