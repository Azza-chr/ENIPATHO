package com.example.enipath.model.Users;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "etudiant")
@PrimaryKeyJoinColumn(name = "id")
@Data
@EqualsAndHashCode(callSuper = true)
public class Etudiant extends Utilisateur {
    
    @Column(name = "niveau")
    private Integer niveau; // 1, 2, ou 3
    
    @Column(name = "groupe")
    private Character groupe; // 'A', 'B', 'C', ou 'D'
    
    @Column(name = "total_badges")
    private int totalBadges;
    
    @Column(name = "score")
    private int score;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "etudiant_enseignants",
        joinColumns = @JoinColumn(name = "etudiant_id"),
        inverseJoinColumns = @JoinColumn(name = "enseignant_id")
    )
    private java.util.List<Enseignant> enseignants = new java.util.ArrayList<>();
}