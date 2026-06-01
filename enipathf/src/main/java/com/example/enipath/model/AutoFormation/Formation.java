package com.example.enipath.model.AutoFormation;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
public class Formation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idFormation;

    private String titre;
    private String domaine;
    private int duree;

    @Enumerated(EnumType.STRING)
    private NiveauFormation niveau;

    private String description;
    private double scoreMin;
    private String fichierUrl;

    @Column(columnDefinition = "TEXT")
    private String roadmapImageUrl;

    @OneToMany(mappedBy = "formation", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<ModuleFormation> modules;

    @OneToOne
    private com.example.enipath.model.academic.Quiz examenFinal;
}