package com.example.enipath.controller;

import com.example.enipath.dto.QuestionDto;
import com.example.enipath.dto.QuizDto;
import com.example.enipath.model.academic.Question;
import com.example.enipath.service.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController("academicQuizController")
@RequestMapping("/api/v1/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping("/{quizId}")
    public QuizDto getQuiz(@PathVariable Long quizId) {
        return quizService.getQuiz(quizId);
    }

    @PostMapping("/{quizId}/questions")
    public ResponseEntity<?> addQuestion(@PathVariable Long quizId, @RequestBody Question request) {
        try {
            QuestionDto question = quizService.addQuestion(quizId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(question);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        } catch (Exception exception) {
            return ResponseEntity.badRequest().body(Map.of("error", "Impossible d'ajouter la question au quiz."));
        }
    }

    @PostMapping("/{quizId}/submit")
    public Map<String, Object> submit(@PathVariable Long quizId, @RequestBody Map<String, Long> request) {
        return quizService.submit(quizId, request);
    }
}
