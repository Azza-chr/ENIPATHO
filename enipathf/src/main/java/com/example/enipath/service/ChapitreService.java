package com.example.enipath.service;

import com.example.enipath.model.academic.Chapitre;
import com.example.enipath.model.academic.RessourcePedagogique;

import java.util.List;

public interface ChapitreService {

    Chapitre create(Long matiereId, Chapitre chapitre);

    List<Chapitre> getByMatiere(Long matiereId);

    Chapitre getDetails(Long chapitreId);

    RessourcePedagogique addResource(Long chapitreId, RessourcePedagogique ressource);
}
