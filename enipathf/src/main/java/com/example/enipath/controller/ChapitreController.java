package com.example.enipath.controller;

import com.example.enipath.dto.AcademicDtoMapper;
import com.example.enipath.dto.ChapitreDto;
import com.example.enipath.dto.QuizDto;
import com.example.enipath.model.academic.Chapitre;
import com.example.enipath.model.academic.Quiz;
import com.example.enipath.model.academic.RessourcePedagogique;
import com.example.enipath.service.ChapitreService;
import com.example.enipath.service.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("academicChapitreController")
@RequestMapping("/api/v1/chapitres")
public class ChapitreController {

    private final ChapitreService chapitreService;
    private final QuizService quizService;

    public ChapitreController(ChapitreService chapitreService, QuizService quizService) {
        this.chapitreService = chapitreService;
        this.quizService = quizService;
    }

    @GetMapping("/{chapitreId}")
    public ChapitreDto getDetails(@PathVariable Long chapitreId) {
        return AcademicDtoMapper.toDto(chapitreService.getDetails(chapitreId));
    }

    @PostMapping("/{chapitreId}/ressources")
    public ResponseEntity<RessourcePedagogique> addResource(@PathVariable Long chapitreId, @RequestBody RessourcePedagogique request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(chapitreService.addResource(chapitreId, request));
    }

    @PostMapping("/{chapitreId}/quiz")
    public ResponseEntity<Quiz> createQuiz(@PathVariable Long chapitreId, @RequestBody Quiz request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.create(chapitreId, request));
    }

    @GetMapping("/{chapitreId}/quiz")
    public QuizDto getQuiz(@PathVariable Long chapitreId) {
        return quizService.getQuizByChapitre(chapitreId);
    }
}
