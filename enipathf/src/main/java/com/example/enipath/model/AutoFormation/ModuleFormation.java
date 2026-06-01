package com.example.enipath.model.AutoFormation;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Data
public class ModuleFormation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idModule;

    private String titre;
    private int ordre;

    @ManyToOne
    @JoinColumn(name = "formation_id")
    @JsonIgnoreProperties("modules")
    private Formation formation;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("module")
    private List<CoursFormation> cours;

    @OneToOne
    private com.example.enipath.model.academic.Quiz examen;
}