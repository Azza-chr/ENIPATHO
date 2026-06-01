package com.example.enipath.service.implementation;

import com.example.enipath.dto.AcademicDtoMapper;
import com.example.enipath.dto.CoursDto;
import com.example.enipath.model.academic.CoursPdf;
import com.example.enipath.model.academic.Matiere;
import com.example.enipath.model.academic.Quiz;
import com.example.enipath.repository.CoursPdfRepository;
import com.example.enipath.repository.MatiereRepository;
import com.example.enipath.repository.QuizRepository;
import com.example.enipath.service.CoursPdfService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import com.example.enipath.repository.EnseignantRepository;
import com.example.enipath.model.Users.Enseignant;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service("academicCoursPdfService")
@Transactional
public class CoursPdfServiceImpl implements CoursPdfService {

    private final CoursPdfRepository coursPdfRepository;
    private final MatiereRepository matiereRepository;
    private final QuizRepository quizRepository;
    private final EnseignantRepository enseignantRepository;
    private final Path uploadPath;

    public CoursPdfServiceImpl(
            CoursPdfRepository coursPdfRepository,
            MatiereRepository matiereRepository,
            QuizRepository quizRepository,
            EnseignantRepository enseignantRepository,
            @Value("${app.upload.dir:uploads/cours}") String uploadDir
    ) {
        this.coursPdfRepository = coursPdfRepository;
        this.matiereRepository = matiereRepository;
        this.quizRepository = quizRepository;
        this.enseignantRepository = enseignantRepository;
        this.uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            Files.createDirectories(this.uploadPath);
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible de creer le dossier d'upload.", exception);
        }
    }

    @Override
    public CoursDto create(Long enseignantId, Long groupeId, String titre, String description, MultipartFile pdf) {
        Enseignant enseignant = enseignantRepository.findById(enseignantId)
                .orElseThrow(() -> new IllegalArgumentException("Enseignant introuvable : " + enseignantId));

        Matiere matiere = enseignant.getMatiere();
        if (matiere == null) {
            throw new IllegalArgumentException("L'enseignant n'a pas de matiere assignee.");
        }

        validateTextFields(titre, description);
        validatePdf(pdf);

        String originalFileName = pdf.getOriginalFilename() == null ? "cours.pdf" : pdf.getOriginalFilename();
        String storedFileName = UUID.randomUUID() + ".pdf";
        Path targetPath = uploadPath.resolve(storedFileName);

        try {
            Files.copy(pdf.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException exception) {
            throw new IllegalStateException("Erreur lors de l'enregistrement du fichier PDF.", exception);
        }

        CoursPdf cours = CoursPdf.builder()
                .titre(titre)
                .description(description)
                .originalFileName(originalFileName)
                .storedFileName(storedFileName)
                .filePath(targetPath.toString())
                .contentType("application/pdf")
                .fileSize(pdf.getSize())
                .createdAt(LocalDateTime.now())
                .matiere(matiere)
                .groupeId(groupeId)
                .build();

        return AcademicDtoMapper.toDto(coursPdfRepository.save(cours));
    }

    @Override
    public List<CoursDto> getByMatiere(Long matiereId) {
        if (!matiereRepository.existsById(matiereId)) {
            throw new IllegalArgumentException("Matiere introuvable : " + matiereId);
        }

        return coursPdfRepository.findByMatiereIdOrderByCreatedAtDesc(matiereId)
                .stream()
                .map(AcademicDtoMapper::toDto)
                .toList();
    }

    @Override
    public List<CoursDto> getByEnseignant(Long enseignantId) {
        Enseignant enseignant = enseignantRepository.findById(enseignantId)
                .orElseThrow(() -> new IllegalArgumentException("Enseignant introuvable : " + enseignantId));
        
        Matiere matiere = enseignant.getMatiere();
        if (matiere == null) {
            return List.of();
        }

        return getByMatiere(matiere.getId());
    }

    @Override
    public CoursDto getById(Long coursId) {
        CoursPdf cours = coursPdfRepository.findById(coursId)
                .orElseThrow(() -> new IllegalArgumentException("Cours introuvable : " + coursId));
        return AcademicDtoMapper.toDto(cours);
    }

    @Override
    public Resource loadAsResource(Long coursId) {
        CoursPdf cours = coursPdfRepository.findById(coursId)
                .orElseThrow(() -> new IllegalArgumentException("Cours introuvable : " + coursId));

        try {
            Resource resource = new UrlResource(Paths.get(cours.getFilePath()).toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new IllegalArgumentException("Fichier introuvable pour le cours : " + coursId);
            }
            return resource;
        } catch (MalformedURLException exception) {
            throw new IllegalArgumentException("Chemin de fichier invalide pour le cours : " + coursId);
        }
    }

    @Override
    public String getOriginalFileName(Long coursId) {
        return coursPdfRepository.findById(coursId)
                .orElseThrow(() -> new IllegalArgumentException("Cours introuvable : " + coursId))
                .getOriginalFileName();
    }

    @Override
    public void delete(Long coursId) {
        CoursPdf cours = coursPdfRepository.findById(coursId)
                .orElseThrow(() -> new IllegalArgumentException("Cours introuvable : " + coursId));

        if (cours.getQuiz() != null) {
            quizRepository.delete(cours.getQuiz());
        }

        try {
            Files.deleteIfExists(Paths.get(cours.getFilePath()));
        } catch (IOException exception) {
            throw new IllegalStateException("Impossible de supprimer le fichier PDF du cours.", exception);
        }

        coursPdfRepository.delete(cours);
    }

    @Override
    public Quiz createQuiz(Long coursId, Quiz quiz) {
        CoursPdf cours = coursPdfRepository.findById(coursId)
                .orElseThrow(() -> new IllegalArgumentException("Cours introuvable : " + coursId));

        if (quiz == null) {
            throw new IllegalArgumentException("Les donnees du quiz sont obligatoires.");
        }

        if (cours.getQuiz() != null) {
            throw new IllegalArgumentException("Ce cours possede deja un quiz.");
        }

        quiz.setId(null);
        quiz.setTitre(isBlank(quiz.getTitre()) ? "Quiz - " + cours.getTitre() : quiz.getTitre().trim());
        quiz.setDescription(isBlank(quiz.getDescription()) ? "Quiz associe au cours " + cours.getTitre() : quiz.getDescription().trim());
        quiz.setDurationMinutes(quiz.getDurationMinutes() == null || quiz.getDurationMinutes() <= 0 ? 10 : quiz.getDurationMinutes());
        quiz.setPassingScore(quiz.getPassingScore() == null ? 50.0 : quiz.getPassingScore());
        quiz.setChapitre(null);
        quiz.setCours(cours);
        quiz.setQuestions(new ArrayList<>());

        Quiz savedQuiz = quizRepository.save(quiz);
        cours.setQuiz(savedQuiz);

        return savedQuiz;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    @Override
    public void deleteQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz introuvable : " + quizId));

        quizRepository.delete(quiz);
    }

    private void validatePdf(MultipartFile pdf) {
        if (pdf == null || pdf.isEmpty()) {
            throw new IllegalArgumentException("Le fichier PDF est obligatoire.");
        }

        String originalName = pdf.getOriginalFilename();
        boolean pdfExtension = originalName != null && originalName.toLowerCase().endsWith(".pdf");
        boolean pdfContentType = "application/pdf".equalsIgnoreCase(pdf.getContentType());

        if (!pdfExtension && !pdfContentType) {
            throw new IllegalArgumentException("Seuls les fichiers PDF sont acceptes.");
        }
    }

    private void validateTextFields(String titre, String description) {
        if (titre == null || titre.trim().isEmpty()) {
            throw new IllegalArgumentException("Le titre est obligatoire.");
        }

        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("La description est obligatoire.");
        }
    }
}
