package com.example.enipath.dto;

import java.time.LocalDateTime;

public record CoursDto(
        Long id,
        String titre,
        String description,
        String originalFileName,
        Long fileSize,
        LocalDateTime createdAt,
        Long matiereId,
        Long groupeId,
        Long quizId,
        String viewUrl,
        String downloadUrl
) {
}
