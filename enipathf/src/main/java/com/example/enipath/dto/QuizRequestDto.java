package com.example.enipath.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record QuizRequestDto(
        @NotBlank @Size(max = 8000) String sourceText,
        @Min(1) @Max(20) int numQuestions
) {}
