package com.example.enipath.repository;

import com.example.enipath.model.academic.ChoixReponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

@org.springframework.stereotype.Repository("academicChoixReponseRepository")
public interface ChoixReponseRepository extends JpaRepository<ChoixReponse, Long> {

    List<ChoixReponse> findByQuestionIdOrderByOrdreAsc(Long questionId);
}
