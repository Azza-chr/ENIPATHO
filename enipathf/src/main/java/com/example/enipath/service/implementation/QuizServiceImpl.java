package com.example.enipath.service.implementation;

import com.example.enipath.dto.ChoixReponseDto;
import com.example.enipath.dto.QuestionDto;
import com.example.enipath.dto.QuizDto;
import com.example.enipath.model.academic.Chapitre;
import com.example.enipath.model.academic.ChoixReponse;
import com.example.enipath.model.academic.Question;
import com.example.enipath.model.academic.Quiz;
import com.example.enipath.repository.ChapitreRepository;
import com.example.enipath.repository.ChoixReponseRepository;
import com.example.enipath.repository.QuestionRepository;
import com.example.enipath.repository.QuizRepository;
import com.example.enipath.service.QuizService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("academicQuizService")
@Transactional
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final ChapitreRepository chapitreRepository;
    private final QuestionRepository questionRepository;
    private final ChoixReponseRepository choixReponseRepository;

    public QuizServiceImpl(
            QuizRepository quizRepository,
            ChapitreRepository chapitreRepository,
            QuestionRepository questionRepository,
            ChoixReponseRepository choixReponseRepository
    ) {
        this.quizRepository = quizRepository;
        this.chapitreRepository = chapitreRepository;
        this.questionRepository = questionRepository;
        this.choixReponseRepository = choixReponseRepository;
    }

    @Override
    public Quiz create(Long chapitreId, Quiz quiz) {
        Chapitre chapitre = chapitreRepository.findById(chapitreId)
                .orElseThrow(() -> new IllegalArgumentException("Chapitre introuvable : " + chapitreId));

        if (chapitre.getQuiz() != null) {
            throw new IllegalArgumentException("Ce chapitre possede deja un quiz.");
        }

        quiz.setId(null);
        quiz.setChapitre(chapitre);
        chapitre.setQuiz(quiz);
        return quizRepository.save(quiz);
    }

    @Override
    public QuestionDto addQuestion(Long quizId, Question question) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz introuvable : " + quizId));

        List<ChoixReponse> incomingChoices = question.getChoices() == null
                ? new ArrayList<>()
                : new ArrayList<>(question.getChoices());

        if (incomingChoices.size() < 2) {
            throw new IllegalArgumentException("Une question doit contenir au moins 2 choix.");
        }

        long numberOfCorrectChoices = incomingChoices.stream().filter(ChoixReponse::isCorrect).count();
        if (numberOfCorrectChoices != 1) {
            throw new IllegalArgumentException("Une question doit avoir exactement une bonne reponse.");
        }

        question.setId(null);
        question.setQuiz(quiz);
        question.setChoices(new ArrayList<>());
        Question savedQuestion = questionRepository.save(question);

        for (ChoixReponse choice : incomingChoices) {
            choice.setId(null);
            choice.setQuestion(savedQuestion);
            choixReponseRepository.save(choice);
        }

        return toQuestionDto(savedQuestion);
    }

    @Override
    public QuizDto getQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz introuvable : " + quizId));

        return buildQuizDto(quiz);
    }

    @Override
    public QuizDto getQuizByChapitre(Long chapitreId) {
        Quiz quiz = quizRepository.findByChapitreId(chapitreId)
                .orElseThrow(() -> new IllegalArgumentException("Aucun quiz pour le chapitre : " + chapitreId));

        return buildQuizDto(quiz);
    }

    @Override
    public Map<String, Object> submit(Long quizId, Map<String, Long> answers) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz introuvable : " + quizId));

        List<Question> questions = questionRepository.findByQuizIdOrderByOrdreAsc(quizId);

        double totalAvailableScore = questions.stream().mapToDouble(Question::getPoints).sum();
        double totalScore = 0;
        int correctAnswers = 0;

        for (Question question : questions) {
            Long selectedChoiceId = answers.get(String.valueOf(question.getId()));
            if (selectedChoiceId == null) {
                continue;
            }

            List<ChoixReponse> questionChoices = choixReponseRepository.findByQuestionIdOrderByOrdreAsc(question.getId());

            boolean isCorrect = questionChoices.stream()
                    .anyMatch(choice -> choice.getId().equals(selectedChoiceId) && choice.isCorrect());

            if (isCorrect) {
                correctAnswers++;
                totalScore += question.getPoints();
            }
        }

        double percentage = totalAvailableScore == 0 ? 0 : (totalScore / totalAvailableScore) * 100.0;
        boolean passed = percentage >= quiz.getPassingScore();

        Map<String, Object> result = new HashMap<>();
        result.put("quizId", quiz.getId());
        result.put("quizTitre", quiz.getTitre());
        result.put("totalQuestions", questions.size());
        result.put("correctAnswers", correctAnswers);
        result.put("totalScore", totalScore);
        result.put("scorePercentage", percentage);
        result.put("passed", passed);
        return result;
    }

    private QuizDto buildQuizDto(Quiz quiz) {
        List<QuestionDto> questionDtos = questionRepository.findByQuizIdOrderByOrdreAsc(quiz.getId())
                .stream()
                .map(this::toQuestionDto)
                .toList();

        return new QuizDto(
                quiz.getId(),
                quiz.getTitre(),
                quiz.getDescription(),
                quiz.getDurationMinutes(),
                quiz.getPassingScore(),
                questionDtos
        );
    }

    private QuestionDto toQuestionDto(Question question) {
        List<ChoixReponseDto> choiceDtos = choixReponseRepository.findByQuestionIdOrderByOrdreAsc(question.getId())
                .stream()
                .map(this::toChoixDto)
                .toList();

        return new QuestionDto(
                question.getId(),
                question.getEnonce(),
                question.getExplication(),
                question.getOrdre(),
                question.getPoints(),
                choiceDtos
        );
    }

    private ChoixReponseDto toChoixDto(ChoixReponse choix) {
        return new ChoixReponseDto(
                choix.getId(),
                choix.getLabel(),
                choix.getOrdre()
        );
    }
}
