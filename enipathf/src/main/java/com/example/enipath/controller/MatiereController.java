package com.example.enipath.controller;

import com.example.enipath.dto.AcademicDtoMapper;
import com.example.enipath.dto.ChapitreDto;
import com.example.enipath.dto.MatiereDto;
import com.example.enipath.model.academic.Chapitre;
import com.example.enipath.model.academic.Matiere;
import com.example.enipath.service.ChapitreService;
import com.example.enipath.service.MatiereService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController("academicMatiereController")
@RequestMapping("/api/v1/matieres")
public class MatiereController {

    private final MatiereService matiereService;
    private final ChapitreService chapitreService;

    public MatiereController(MatiereService matiereService, ChapitreService chapitreService) {
        this.matiereService = matiereService;
        this.chapitreService = chapitreService;
    }

    @GetMapping("/{matiereId}")
    public MatiereDto getDetails(@PathVariable Long matiereId) {
        return AcademicDtoMapper.toDto(matiereService.getDetails(matiereId));
    }

    @GetMapping("/{matiereId}/chapitres")
    public List<ChapitreDto> getChapitres(@PathVariable Long matiereId) {
        return chapitreService.getByMatiere(matiereId).stream()
                .map(AcademicDtoMapper::toSimpleDto)
                .toList();
    }

    @PostMapping("/{matiereId}/chapitres")
    public ResponseEntity<Chapitre> createChapitre(@PathVariable Long matiereId, @RequestBody Chapitre request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chapitreService.create(matiereId, request));
    }
}
