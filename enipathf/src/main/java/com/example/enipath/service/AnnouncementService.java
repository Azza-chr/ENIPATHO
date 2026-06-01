package com.example.enipath.service;

import com.example.enipath.dto.AnnouncementDto;
import com.example.enipath.dto.CreateAnnouncementRequest;
import com.example.enipath.model.Users.Enseignant;
import com.example.enipath.model.Users.Etudiant;
import com.example.enipath.model.communication.Announcement;
import com.example.enipath.model.communication.StudentNotification;
import com.example.enipath.repository.AnnouncementRepository;
import com.example.enipath.repository.EnseignantRepository;
import com.example.enipath.repository.EtudiantRepository;
import com.example.enipath.repository.StudentNotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final EnseignantRepository enseignantRepository;
    private final EtudiantRepository etudiantRepository;
    private final StudentNotificationRepository studentNotificationRepository;

    public AnnouncementService(AnnouncementRepository announcementRepository,
                               EnseignantRepository enseignantRepository,
                               EtudiantRepository etudiantRepository,
                               StudentNotificationRepository studentNotificationRepository) {
        this.announcementRepository = announcementRepository;
        this.enseignantRepository = enseignantRepository;
        this.etudiantRepository = etudiantRepository;
        this.studentNotificationRepository = studentNotificationRepository;
    }

    public List<AnnouncementDto> getAll() {
        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .toList();
    }

    public AnnouncementDto create(CreateAnnouncementRequest request) {
        if (request == null || request.getEnseignantId() == null || isBlank(request.getTitre()) || isBlank(request.getContenu())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'enseignant, le titre et le contenu sont obligatoires.");
        }

        Enseignant enseignant = enseignantRepository.findById(request.getEnseignantId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Enseignant introuvable."));
        Announcement announcement = new Announcement();
        announcement.setTitre(request.getTitre().trim());
        announcement.setContenu(request.getContenu().trim());
        announcement.setEnseignant(enseignant);

        Announcement saved = announcementRepository.save(announcement);
        createNotificationsForStudents(saved);
        return toDto(saved);
    }

    public List<AnnouncementDto> getLatest(int limit) {
        return announcementRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .limit(limit)
                .map(this::toDto)
                .toList();
    }

    public long countAll() {
        return announcementRepository.count();
    }

    public long countForTeacher(Long enseignantId) {
        return announcementRepository.countByEnseignantId(enseignantId);
    }

    private void createNotificationsForStudents(Announcement announcement) {
        List<Etudiant> etudiants = etudiantRepository.findAll();
        List<StudentNotification> notifications = etudiants.stream()
                .map(etudiant -> {
                    StudentNotification notification = new StudentNotification();
                    notification.setEtudiant(etudiant);
                    notification.setTitre("Nouvelle annonce");
                    notification.setContenu(announcement.getTitre());
                    notification.setLue(false);
                    return notification;
                })
                .toList();
        studentNotificationRepository.saveAll(notifications);
    }

    private AnnouncementDto toDto(Announcement announcement) {
        String fullName = (announcement.getEnseignant().getPrenom() + " " + announcement.getEnseignant().getNom()).trim();
        return AnnouncementDto.builder()
                .id(announcement.getId())
                .titre(announcement.getTitre())
                .contenu(announcement.getContenu())
                .enseignantId(announcement.getEnseignant().getId())
                .enseignantNom(fullName)
                .createdAt(announcement.getCreatedAt())
                .build();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
