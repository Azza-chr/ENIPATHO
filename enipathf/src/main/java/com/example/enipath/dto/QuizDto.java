package com.example.enipath.dto;

import java.util.List;

public record QuizDto(
        Long id,
        String titre,
        String description,
        Integer durationMinutes,
        Double passingScore,
        List<QuestionDto> questions
) {
}
