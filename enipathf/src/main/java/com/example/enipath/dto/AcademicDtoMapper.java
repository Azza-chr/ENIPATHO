package com.example.enipath.dto;

import com.example.enipath.model.academic.Chapitre;
import com.example.enipath.model.academic.ChoixReponse;
import com.example.enipath.model.academic.CoursPdf;
import com.example.enipath.model.academic.Matiere;
import com.example.enipath.model.academic.Question;
import com.example.enipath.model.academic.Quiz;
import com.example.enipath.model.academic.RessourcePedagogique;
import com.example.enipath.model.academic.Semestre;

import java.util.List;

public final class AcademicDtoMapper {

    private AcademicDtoMapper() {
    }

    public static SemestreDto toDto(Semestre semestre) {
        return new SemestreDto(
                semestre.getId(),
                semestre.getCode(),
                semestre.getLibelle(),
                semestre.getOrdre()
        );
    }

    public static MatiereDto toSimpleDto(Matiere matiere) {
        return new MatiereDto(
                matiere.getId(),
                matiere.getCode(),
                matiere.getNom(),
                matiere.getDescription(),
                matiere.getEnseignantNom(),
                matiere.getSemestre() != null ? matiere.getSemestre().getId() : null,
                matiere.getSemestre() != null ? matiere.getSemestre().getLibelle() : null,
                null
        );
    }

    public static MatiereDto toDto(Matiere matiere) {
        List<ChapitreDto> chapitres = matiere.getChapitres() == null ? List.of() :
                matiere.getChapitres().stream()
                        .sorted((a, b) -> a.getOrdre().compareTo(b.getOrdre()))
                        .map(AcademicDtoMapper::toSimpleDto)
                        .toList();

        return new MatiereDto(
                matiere.getId(),
                matiere.getCode(),
                matiere.getNom(),
                matiere.getDescription(),
                matiere.getEnseignantNom(),
                matiere.getSemestre() != null ? matiere.getSemestre().getId() : null,
                matiere.getSemestre() != null ? matiere.getSemestre().getLibelle() : null,
                chapitres
        );
    }

    public static ChapitreDto toSimpleDto(Chapitre chapitre) {
        return new ChapitreDto(
                chapitre.getId(),
                chapitre.getTitre(),
                chapitre.getDescription(),
                chapitre.getOrdre(),
                chapitre.isPublished(),
                null,
                chapitre.getQuiz() != null ? toSimpleDto(chapitre.getQuiz()) : null
        );
    }

    public static ChapitreDto toDto(Chapitre chapitre) {
        List<RessourceDto> ressources = chapitre.getRessources() == null ? List.of() :
                chapitre.getRessources().stream()
                        .map(AcademicDtoMapper::toDto)
                        .toList();

        return new ChapitreDto(
                chapitre.getId(),
                chapitre.getTitre(),
                chapitre.getDescription(),
                chapitre.getOrdre(),
                chapitre.isPublished(),
                ressources,
                chapitre.getQuiz() != null ? toSimpleDto(chapitre.getQuiz()) : null
        );
    }

    public static RessourceDto toDto(RessourcePedagogique ressource) {
        return new RessourceDto(
                ressource.getId(),
                ressource.getTitre(),
                ressource.getDescription(),
                ressource.getType() != null ? ressource.getType().name() : null,
                ressource.getFileUrl(),
                ressource.getMimeType()
        );
    }

    public static QuizDto toSimpleDto(Quiz quiz) {
        return new QuizDto(
                quiz.getId(),
                quiz.getTitre(),
                quiz.getDescription(),
                quiz.getDurationMinutes(),
                quiz.getPassingScore(),
                null
        );
    }

    public static QuizDto toDto(Quiz quiz) {
        List<QuestionDto> questions = quiz.getQuestions() == null ? List.of() :
                quiz.getQuestions().stream()
                        .sorted((a, b) -> a.getOrdre().compareTo(b.getOrdre()))
                        .map(AcademicDtoMapper::toDto)
                        .toList();

        return new QuizDto(
                quiz.getId(),
                quiz.getTitre(),
                quiz.getDescription(),
                quiz.getDurationMinutes(),
                quiz.getPassingScore(),
                questions
        );
    }

    public static QuestionDto toDto(Question question) {
        List<ChoixReponseDto> choices = question.getChoices() == null ? List.of() :
                question.getChoices().stream()
                        .sorted((a, b) -> a.getOrdre().compareTo(b.getOrdre()))
                        .map(AcademicDtoMapper::toDto)
                        .toList();

        return new QuestionDto(
                question.getId(),
                question.getEnonce(),
                question.getExplication(),
                question.getOrdre(),
                question.getPoints(),
                choices
        );
    }

    public static ChoixReponseDto toDto(ChoixReponse choix) {
        return new ChoixReponseDto(
                choix.getId(),
                choix.getLabel(),
                choix.getOrdre()
        );
    }

    public static CoursDto toDto(CoursPdf cours) {
        return new CoursDto(
                cours.getId(),
                cours.getTitre(),
                cours.getDescription(),
                cours.getOriginalFileName(),
                cours.getFileSize(),
                cours.getCreatedAt(),
                cours.getMatiere() != null ? cours.getMatiere().getId() : null,
                cours.getGroupeId(),
                cours.getQuiz() != null ? cours.getQuiz().getId() : null,
                "/api/v1/cours/" + cours.getId() + "/view",
                "/api/v1/cours/" + cours.getId() + "/download"
        );
    }
}
