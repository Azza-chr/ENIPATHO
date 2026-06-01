package com.example.enipath.dto;

public record RessourceDto(
        Long id,
        String titre,
        String description,
        String type,
        String fileUrl,
        String mimeType
) {
}
