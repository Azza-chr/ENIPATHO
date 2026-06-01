package com.example.enipath.dto;

import java.util.List;

public record ChapitreDto(
        Long id,
        String titre,
        String description,
        Integer ordre,
        boolean published,
        List<RessourceDto> ressources,
        QuizDto quiz
) {
}
