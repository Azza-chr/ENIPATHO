package com.example.enipath.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementDto {
    private Long id;
    private String titre;
    private String contenu;
    private Long enseignantId;
    private String enseignantNom;
    private LocalDateTime createdAt;
}
