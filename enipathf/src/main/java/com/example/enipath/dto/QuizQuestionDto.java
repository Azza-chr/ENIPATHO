package com.example.enipath.dto;

import java.util.List;

public record QuizQuestionDto(
        String question,
        List<String> options,
        int correctIndex,
        String explanation
) {}
