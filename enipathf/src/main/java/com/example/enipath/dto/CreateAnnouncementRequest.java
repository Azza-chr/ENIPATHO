package com.example.enipath.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAnnouncementRequest {
    private Long enseignantId;
    private String titre;
    private String contenu;
}
