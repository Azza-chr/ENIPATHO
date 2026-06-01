package com.example.enipath.service;

import com.example.enipath.dto.CoursDto;
import com.example.enipath.model.academic.Quiz;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CoursPdfService {

    CoursDto create(Long enseignantId, Long groupeId, String titre, String description, MultipartFile pdf);

    List<CoursDto> getByMatiere(Long matiereId);

    List<CoursDto> getByEnseignant(Long enseignantId);

    CoursDto getById(Long coursId);

    Resource loadAsResource(Long coursId);

    String getOriginalFileName(Long coursId);

    void delete(Long coursId);

    Quiz createQuiz(Long coursId, Quiz quiz);

    void deleteQuiz(Long quizId);
}
