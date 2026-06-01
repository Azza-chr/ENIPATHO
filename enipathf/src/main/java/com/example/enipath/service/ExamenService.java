package com.example.enipath.service;

import com.example.enipath.model.AutoFormation.BadgeFormation;
import com.example.enipath.model.AutoFormation.TypeBadgeFormation;
import com.example.enipath.model.academic.Question;
import com.example.enipath.model.academic.Quiz;
import com.example.enipath.model.Users.Etudiant;
import com.example.enipath.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ExamenService {

    @Autowired
    private QuizRepository quizzRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private BadgeFormationRepository badgeFormationRepository;

    @Autowired
    private FormationService formationService;

    public Map<String, Object> soumettrExamen(
            Long quizzId,
            Long etudiantId,
            Map<Long, String> reponsesEtudiant) {

        Map<String, Object> resultat = new HashMap<>();

        Optional<Quiz> quizzOpt = quizzRepository.findById(quizzId);
        if (quizzOpt.isEmpty()) {
            resultat.put("erreur", "Examen introuvable.");
            return resultat;
        }

        Quiz quizz = quizzOpt.get();
        List<Question> questions = questionRepository.findByQuizIdOrderByOrdreAsc(quizzId);

        if (questions.isEmpty()) {
            resultat.put("erreur", "Aucune question trouvée.");
            return resultat;
        }

        int totalQuestions = questions.size();
        int bonnesReponses = 0;

        for (Question question : questions) {
            String reponseEtudiant = reponsesEtudiant.get(question.getIdQuestion());
            if (reponseEtudiant != null &&
                    reponseEtudiant.trim().equalsIgnoreCase(question.getReponseCorrecte().trim())) {
                bonnesReponses++;
            }
        }

        double scoreObtenu = ((double) bonnesReponses / totalQuestions) * 100;
        double scoreArrondi = Math.round(scoreObtenu * 10.0) / 10.0;
        boolean valide = scoreArrondi >= quizz.getScoreMinimum();

        resultat.put("scoreObtenu", scoreArrondi);
        resultat.put("bonnesReponses", bonnesReponses);
        resultat.put("totalQuestions", totalQuestions);
        resultat.put("scoreMinimum", quizz.getScoreMinimum());
        resultat.put("valide", valide);

        if (valide) {
            Optional<Etudiant> etudiantOpt = etudiantRepository.findById(etudiantId);
            if (etudiantOpt.isPresent()) {
                BadgeFormation badge = new BadgeFormation();
                badge.setNomBadge("Module validé : " + quizz.getTitreQ());
                badge.setIcone("✅");
                badge.setDescription("Score obtenu : " + scoreArrondi + "%");
                badge.setDateObtention(new Date());
                badge.setType(TypeBadgeFormation.ModuleValide);
                badge.setEtudiant(etudiantOpt.get());
                badgeFormationRepository.save(badge);
            }
            resultat.put("message", "Félicitations ! Module validé avec " + scoreArrondi + "%");
        } else {
            resultat.put("message", "Score insuffisant (" + scoreArrondi + "%). Minimum requis : "
                    + quizz.getScoreMinimum() + "%. Vous pouvez repasser l'examen.");
        }

        return resultat;
    }

    public Map<String, Object> soumettreExamenFinal(
            Long quizzId,
            Long etudiantId,
            Long formationId,
            Map<Long, String> reponsesEtudiant) {

        Map<String, Object> resultat = soumettrExamen(quizzId, etudiantId, reponsesEtudiant);

        boolean valide = (boolean) resultat.getOrDefault("valide", false);

        if (valide) {
            double score = (double) resultat.get("scoreObtenu");
            String certifMessage = formationService.genererCertification(etudiantId, formationId, score);
            resultat.put("certification", certifMessage);
        }

        return resultat;
    }
}