package com.example.enipath.controller;

import com.example.enipath.service.ExamenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/examens")
@CrossOrigin(origins = "http://localhost:4200")
public class ExamenController {

    @Autowired
    private ExamenService examenService;

    // Passer un examen de module
    @PostMapping("/soumettre/{quizzId}")
    public Map<String, Object> soumettre(
            @PathVariable Long quizzId,
            @RequestParam Long etudiantId,
            @RequestBody Map<Long, String> reponses) {
        return examenService.soumettrExamen(quizzId, etudiantId, reponses);
    }

    // Passer l'examen final
    @PostMapping("/soumettre-final/{quizzId}")
    public Map<String, Object> soumettreExamenFinal(
            @PathVariable Long quizzId,
            @RequestParam Long etudiantId,
            @RequestParam Long formationId,
            @RequestBody Map<Long, String> reponses) {
        return examenService.soumettreExamenFinal(quizzId, etudiantId, formationId, reponses);
    }
}