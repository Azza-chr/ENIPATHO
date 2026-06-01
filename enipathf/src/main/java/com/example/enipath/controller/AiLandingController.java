package com.example.enipath.controller;

import com.example.enipath.dto.*;
import com.example.enipath.service.AiLandingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai-landing")
public class AiLandingController {

    private final AiLandingService service;

    public AiLandingController(AiLandingService service) {
        this.service = service;
    }

    @PostMapping("/ask")
    public ResponseEntity<SpeechResponseDto> ask(@Valid @RequestBody SpeechRequestDto req) {
        return ResponseEntity.ok(service.answerQuestion(req));
    }

    @PostMapping(value = "/ocr", consumes = "multipart/form-data")
    public ResponseEntity<OcrResponseDto> ocr(@RequestParam("image") MultipartFile image) {
        return ResponseEntity.ok(service.extractAndSummarize(image));
    }

    @PostMapping("/quiz")
    public ResponseEntity<QuizResponseDto> quiz(@Valid @RequestBody QuizRequestDto req) {
        return ResponseEntity.ok(service.generateQuiz(req));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("ai-landing: OK");
    }
}
