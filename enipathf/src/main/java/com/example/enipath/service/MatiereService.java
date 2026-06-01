package com.example.enipath.service;

import com.example.enipath.model.academic.Matiere;

import java.util.List;

public interface MatiereService {

    Matiere create(Long semestreId, Matiere matiere);

    List<Matiere> getBySemestre(Long semestreId);

    Matiere getDetails(Long matiereId);
}
