package com.example.enipath.controller;

import com.example.enipath.dto.AcademicDtoMapper;
import com.example.enipath.dto.MatiereDto;
import com.example.enipath.dto.SemestreDto;
import com.example.enipath.model.academic.Matiere;
import com.example.enipath.model.academic.Semestre;
import com.example.enipath.service.implementation.MatiereServiceImpl;
import com.example.enipath.service.implementation.SemestreServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("academicSemestreController")
@RequestMapping("/api/v1/semestres")
public class SemestreController {

    private final SemestreServiceImpl semestreService;
    private final MatiereServiceImpl matiereService;

    public SemestreController(SemestreServiceImpl semestreService, MatiereServiceImpl matiereService) {
        this.semestreService = semestreService;
        this.matiereService = matiereService;
    }

    @PostMapping
    public ResponseEntity<Semestre> create(@RequestBody Semestre request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(semestreService.create(request));
    }

    @GetMapping
    public List<SemestreDto> getAll() {
        return semestreService.getAll().stream()
                .map(AcademicDtoMapper::toDto)
                .toList();
    }

    @PostMapping("/{semestreId}/matieres")
    public ResponseEntity<Matiere> createMatiere(@PathVariable Long semestreId, @RequestBody Matiere request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(matiereService.create(semestreId, request));
    }

    @GetMapping("/{semestreId}/matieres")
    public List<MatiereDto> getMatieres(@PathVariable Long semestreId) {
        return matiereService.getBySemestre(semestreId).stream()
                .map(AcademicDtoMapper::toSimpleDto)
                .toList();
    }
}
