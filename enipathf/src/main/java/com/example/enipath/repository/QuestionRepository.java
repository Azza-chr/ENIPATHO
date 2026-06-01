package com.example.enipath.repository;

import com.example.enipath.model.academic.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@org.springframework.stereotype.Repository("academicQuestionRepository")
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByQuizIdOrderByOrdreAsc(Long quizId);
}