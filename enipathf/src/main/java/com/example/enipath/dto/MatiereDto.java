package com.example.enipath.dto;

import java.util.List;

public record MatiereDto(
        Long id,
        String code,
        String nom,
        String description,
        String enseignantNom,
        Long semestreId,
        String semestreLibelle,
        List<ChapitreDto> chapitres
) {
}
