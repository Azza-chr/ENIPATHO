package com.example.enipath.model.Users;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import com.example.enipath.model.academic.Groupe;

import java.util.List;

@Entity
@Table(name = "enseignant")
@PrimaryKeyJoinColumn(name = "id")
@Data
@EqualsAndHashCode(callSuper = true)
public class Enseignant extends Utilisateur {
    
    @Column(name = "departement")
    private String departement;
    
    @Column(name = "specialite")
    private String specialite;
    
    @Column(name = "max_groupes")
    private Integer maxGroupes = 3;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matiere_id")
    private com.example.enipath.model.academic.Matiere matiere;
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "enseignant_groupes",
        joinColumns = @JoinColumn(name = "enseignant_id"),
        inverseJoinColumns = @JoinColumn(name = "groupe_id")
    )
    private java.util.List<Groupe> groupes = new java.util.ArrayList<>();

}