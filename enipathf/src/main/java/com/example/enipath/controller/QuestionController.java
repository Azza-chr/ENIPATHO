package com.example.enipath.controller;

import com.example.enipath.model.academic.Question;
import com.example.enipath.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "http://localhost:4200")
public class QuestionController {

    @Autowired
    private QuestionRepository questionRepository;

    @GetMapping
    public List<Question> getAll() { return questionRepository.findAll(); }

    @GetMapping("/quizz/{quizzId}")
    public List<Question> getByQuizz(@PathVariable Long quizzId) {
        return questionRepository.findByQuizIdOrderByOrdreAsc(quizzId);
    }

    @PostMapping
    public Question create(@RequestBody Question question) { return questionRepository.save(question); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { questionRepository.deleteById(id); }
}