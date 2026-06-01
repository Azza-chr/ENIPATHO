package com.example.enipath.service.implementation;

import com.example.enipath.model.academic.Semestre;
import com.example.enipath.repository.SemestreRepository;
import com.example.enipath.service.SemestreService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service("academicSemestreService")
@Transactional
public class SemestreServiceImpl implements SemestreService {

    private final SemestreRepository semestreRepository;

    public SemestreServiceImpl(SemestreRepository semestreRepository) {
        this.semestreRepository = semestreRepository;
    }

    @Override
    public Semestre create(Semestre semestre) {
        semestre.setId(null);
        return semestreRepository.save(semestre);
    }

    @Override
    public List<Semestre> getAll() {
        return semestreRepository.findAllByOrderByOrdreAsc();
    }
}
