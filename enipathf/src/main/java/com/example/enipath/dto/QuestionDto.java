package com.example.enipath.dto;

import java.util.List;

public record QuestionDto(
        Long id,
        String enonce,
        String explication,
        Integer ordre,
        Double points,
        List<ChoixReponseDto> choices
) {
}
