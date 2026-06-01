package com.example.enipath.model.AutoFormation;

import com.example.enipath.model.Users.Etudiant;
import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Data
public class BadgeFormation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idBadge;

    private String nomBadge;
    private String icone;
    private String description;
    private Date dateObtention;

    @Enumerated(EnumType.STRING)
    private TypeBadgeFormation type;

    @ManyToOne
    private Etudiant etudiant;
}