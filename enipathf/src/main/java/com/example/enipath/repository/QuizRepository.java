package com.example.enipath.repository;

import com.example.enipath.model.academic.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

@org.springframework.stereotype.Repository("academicQuizRepository")
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    Optional<Quiz> findByChapitreId(Long chapitreId);
}
