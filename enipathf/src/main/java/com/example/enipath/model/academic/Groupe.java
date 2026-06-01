package com.example.enipath.model.academic;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "groupe", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"code", "niveau"})
})
@Data
@NoArgsConstructor
public class Groupe {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "groupe_id")
    private Long id;
    
    @Column(name = "code", nullable = false, length = 1)
    private Character code; // 'A', 'B', 'C', ou 'D'
    
    @Column(name = "niveau", nullable = false)
    private Integer niveau; // 1, 2, ou 3
    
    @Column(name = "max_etudiants")
    private Integer maxEtudiants = 30;
    
    @Column(name = "nombre_etudiants")
    private Integer nombreEtudiants = 0;
    
    public Groupe(Character code, Integer niveau) {
        this.code = code;
        this.niveau = niveau;
        this.maxEtudiants = 30;
        this.nombreEtudiants = 0;
    }
}
