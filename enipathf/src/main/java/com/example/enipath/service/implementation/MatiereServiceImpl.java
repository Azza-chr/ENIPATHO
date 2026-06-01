package com.example.enipath.service.implementation;

import com.example.enipath.model.academic.Matiere;
import com.example.enipath.model.academic.Semestre;
import com.example.enipath.repository.MatiereRepository;
import com.example.enipath.repository.SemestreRepository;
import com.example.enipath.service.MatiereService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service("academicMatiereService")
@Transactional
public class MatiereServiceImpl implements MatiereService {

    private final MatiereRepository matiereRepository;
    private final SemestreRepository semestreRepository;

    public MatiereServiceImpl(MatiereRepository matiereRepository, SemestreRepository semestreRepository) {
        this.matiereRepository = matiereRepository;
        this.semestreRepository = semestreRepository;
    }

    @Override
    public Matiere create(Long semestreId, Matiere matiere) {
        Semestre semestre = semestreRepository.findById(semestreId)
                .orElseThrow(() -> new IllegalArgumentException("Semestre introuvable : " + semestreId));

        matiere.setId(null);
        matiere.setSemestre(semestre);
        if (matiere.getChapitres() == null) {
            matiere.setChapitres(new ArrayList<>());
        }
        return matiereRepository.save(matiere);
    }

    @Override
    public List<Matiere> getBySemestre(Long semestreId) {
        if (!semestreRepository.existsById(semestreId)) {
            throw new IllegalArgumentException("Semestre introuvable : " + semestreId);
        }

        return matiereRepository.findBySemestreIdOrderByNomAsc(semestreId);
    }

    @Override
    public Matiere getDetails(Long matiereId) {
        Matiere matiere = matiereRepository.findById(matiereId)
                .orElseThrow(() -> new IllegalArgumentException("Matiere introuvable : " + matiereId));

        matiere.getChapitres().forEach(chapitre -> {
            chapitre.getRessources().size();
            if (chapitre.getQuiz() != null) {
                chapitre.getQuiz().getId();
            }
        });

        return matiere;
    }
}
