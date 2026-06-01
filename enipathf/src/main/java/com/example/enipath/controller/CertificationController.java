package com.example.enipath.controller;

import com.example.enipath.model.AutoFormation.Certification;
import com.example.enipath.repository.CertificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/certifications")
@CrossOrigin(origins = "http://localhost:4200")
public class CertificationController {

    @Autowired
    private CertificationRepository certificationRepository;

    @GetMapping
    public List<Certification> getAll() { return certificationRepository.findAll(); }

    @GetMapping("/etudiant/{etudiantId}")
    public List<Certification> getByEtudiant(@PathVariable Long etudiantId) {
        return certificationRepository.findByEtudiantId(etudiantId);
    }

    @PostMapping
    public Certification create(@RequestBody Certification certification) {
        return certificationRepository.save(certification);
    }
}