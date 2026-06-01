package com.example.enipath.controller;

import com.example.enipath.dto.CreateQuizRequest;
import com.example.enipath.dto.CoursDto;
import com.example.enipath.model.academic.Quiz;
import com.example.enipath.service.CoursPdfService;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController("academicCoursPdfController")
@RequestMapping("/api/v1")
public class CoursPdfController {

    private final CoursPdfService coursPdfService;

    public CoursPdfController(CoursPdfService coursPdfService) {
        this.coursPdfService = coursPdfService;
    }

    @GetMapping("/matieres/{matiereId}/cours")
    public List<CoursDto> getByMatiere(@PathVariable Long matiereId) {
        return coursPdfService.getByMatiere(matiereId);
    }

    @GetMapping("/enseignants/{enseignantId}/cours")
    public List<CoursDto> getByEnseignant(@PathVariable Long enseignantId) {
        return coursPdfService.getByEnseignant(enseignantId);
    }

    @PostMapping(value = "/enseignants/{enseignantId}/groupes/{groupeId}/cours", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CoursDto create(
            @PathVariable Long enseignantId,
            @PathVariable Long groupeId,
            @RequestParam String titre,
            @RequestParam String description,
            @RequestParam(value = "pdf", required = false) MultipartFile pdf,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) {
        MultipartFile uploadedFile = pdf != null && !pdf.isEmpty() ? pdf : file;
        return coursPdfService.create(enseignantId, groupeId, titre, description, uploadedFile);
    }

    @GetMapping("/cours/{coursId}")
    public CoursDto getById(@PathVariable Long coursId) {
        return coursPdfService.getById(coursId);
    }

    @DeleteMapping("/cours/{coursId}")
    public ResponseEntity<Void> delete(@PathVariable Long coursId) {
        coursPdfService.delete(coursId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/cours/{coursId}/download")
    public ResponseEntity<Resource> download(@PathVariable Long coursId) {
        Resource resource = coursPdfService.loadAsResource(coursId);
        String fileName = coursPdfService.getOriginalFileName(coursId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(fileName).build().toString())
                .body(resource);
    }

    @GetMapping("/cours/{coursId}/view")
    public ResponseEntity<Resource> view(@PathVariable Long coursId) {
        Resource resource = coursPdfService.loadAsResource(coursId);
        String fileName = coursPdfService.getOriginalFileName(coursId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(fileName).build().toString())
                .body(resource);
    }

    @PostMapping("/cours/{coursId}/quiz")
    public ResponseEntity<Map<String, Object>> createQuiz(@PathVariable Long coursId, @org.springframework.web.bind.annotation.RequestBody CreateQuizRequest request) {
        try {
            Quiz quiz = new Quiz();
            quiz.setTitre(request.getTitre());
            quiz.setDescription(request.getDescription());
            quiz.setDurationMinutes(request.getDurationMinutes());
            quiz.setPassingScore(request.getPassingScore());

            Quiz createdQuiz = coursPdfService.createQuiz(coursId, quiz);
            return ResponseEntity.ok(Map.of(
                    "id", createdQuiz.getId(),
                    "titre", createdQuiz.getTitre()
            ));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
        } catch (Exception exception) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Impossible de creer le quiz. Verifiez les donnees envoyees."
            ));
        }
    }

    @DeleteMapping("/quizzes/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long quizId) {
        coursPdfService.deleteQuiz(quizId);
        return ResponseEntity.noContent().build();
    }
}
