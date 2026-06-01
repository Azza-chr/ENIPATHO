package com.example.enipath.service;

import com.example.enipath.dto.QuizDto;
import com.example.enipath.dto.QuestionDto;
import com.example.enipath.model.academic.Question;
import com.example.enipath.model.academic.Quiz;

import java.util.Map;

public interface QuizService {

    Quiz create(Long chapitreId, Quiz quiz);

    QuestionDto addQuestion(Long quizId, Question question);

    QuizDto getQuiz(Long quizId);

    QuizDto getQuizByChapitre(Long chapitreId);

    Map<String, Object> submit(Long quizId, Map<String, Long> answers);
}
