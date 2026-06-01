package com.example.enipath.service;

import com.example.enipath.model.academic.Semestre;

import java.util.List;

public interface SemestreService {

    Semestre create(Semestre semestre);

    List<Semestre> getAll();
}
