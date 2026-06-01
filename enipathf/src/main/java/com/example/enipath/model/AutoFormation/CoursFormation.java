package com.example.enipath.model.AutoFormation;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class CoursFormation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCoursFormation;

    private String titre;

    @Column(columnDefinition = "TEXT")
    private String contenu;

    private int ordre;

    @ManyToOne
    @JoinColumn(name = "module_id")
    @JsonIgnoreProperties("cours")
    private ModuleFormation module;
}