package com.example.enipath.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EtudiantProfileDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private Integer niveau;
    private Character groupe;
    private int totalBadges;
    private int score;
    private byte[] photo;
    private String phoneNumber;
    private String adresse;
}
