package com.example.enipath.model.AutoFormation;

import com.example.enipath.model.Users.Etudiant;
import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity
@Data

public class Certification {
    @Id
    @GeneratedValue( strategy = GenerationType.IDENTITY)
    private Long idCertif;
    private String titre;
    private Date dateEmission;
    private String signatureNumerique;
    @ManyToOne
    private Etudiant etudiant;
    @ManyToOne
    private Formation formation;





}
