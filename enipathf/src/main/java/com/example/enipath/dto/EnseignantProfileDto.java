package com.example.enipath.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnseignantProfileDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String departement;
    private String specialite;
    private String matiereName;
    private int nombreGroupes;
    private byte[] photo;
    private String phoneNumber;
    private String bureau;
}
