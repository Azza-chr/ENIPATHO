package com.example.enipath.dto;

import java.util.List;

public record QuizResponseDto(String topic, List<QuizQuestionDto> questions) {}
