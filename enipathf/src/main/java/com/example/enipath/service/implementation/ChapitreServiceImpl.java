package com.example.enipath.service.implementation;

import com.example.enipath.model.academic.Chapitre;
import com.example.enipath.model.academic.Matiere;
import com.example.enipath.model.academic.RessourcePedagogique;
import com.example.enipath.repository.ChapitreRepository;
import com.example.enipath.repository.MatiereRepository;
import com.example.enipath.repository.RessourcePedagogiqueRepository;
import com.example.enipath.service.ChapitreService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service("academicChapitreService")
@Transactional
public class ChapitreServiceImpl implements ChapitreService {

    private final ChapitreRepository chapitreRepository;
    private final MatiereRepository matiereRepository;
    private final RessourcePedagogiqueRepository ressourceRepository;

    public ChapitreServiceImpl(
            ChapitreRepository chapitreRepository,
            MatiereRepository matiereRepository,
            RessourcePedagogiqueRepository ressourceRepository
    ) {
        this.chapitreRepository = chapitreRepository;
        this.matiereRepository = matiereRepository;
        this.ressourceRepository = ressourceRepository;
    }

    @Override
    public Chapitre create(Long matiereId, Chapitre chapitre) {
        Matiere matiere = matiereRepository.findById(matiereId)
                .orElseThrow(() -> new IllegalArgumentException("Matiere introuvable : " + matiereId));

        chapitre.setId(null);
        chapitre.setMatiere(matiere);
        if (chapitre.getRessources() == null) {
            chapitre.setRessources(new ArrayList<>());
        }
        return chapitreRepository.save(chapitre);
    }

    @Override
    public List<Chapitre> getByMatiere(Long matiereId) {
        if (!matiereRepository.existsById(matiereId)) {
            throw new IllegalArgumentException("Matiere introuvable : " + matiereId);
        }

        return chapitreRepository.findByMatiereIdOrderByOrdreAsc(matiereId);
    }

    @Override
    public Chapitre getDetails(Long chapitreId) {
        Chapitre chapitre = chapitreRepository.findById(chapitreId)
                .orElseThrow(() -> new IllegalArgumentException("Chapitre introuvable : " + chapitreId));

        chapitre.getRessources().size();
        if (chapitre.getQuiz() != null) {
            chapitre.getQuiz().getQuestions().size();
        }

        return chapitre;
    }

    @Override
    public RessourcePedagogique addResource(Long chapitreId, RessourcePedagogique ressource) {
        Chapitre chapitre = chapitreRepository.findById(chapitreId)
                .orElseThrow(() -> new IllegalArgumentException("Chapitre introuvable : " + chapitreId));

        ressource.setId(null);
        ressource.setChapitre(chapitre);
        return ressourceRepository.save(ressource);
    }
}
