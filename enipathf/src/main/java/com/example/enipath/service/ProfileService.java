package com.example.enipath.service;

import com.example.enipath.dto.EtudiantProfileDto;
import com.example.enipath.dto.EnseignantProfileDto;
import com.example.enipath.model.Users.Etudiant;
import com.example.enipath.model.Users.Enseignant;
import com.example.enipath.model.Users.Utilisateur;
import com.example.enipath.repository.EtudiantRepository;
import com.example.enipath.repository.EnseignantRepository;
import com.example.enipath.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class ProfileService {
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @Autowired
    private EtudiantRepository etudiantRepository;
    
    @Autowired
    private EnseignantRepository enseignantRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * Récupère le profil d'un étudiant
     */
    public EtudiantProfileDto getEtudiantProfile(Long studentId) {
        Etudiant student = etudiantRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
        
        return EtudiantProfileDto.builder()
            .id(student.getId())
            .nom(student.getNom())
            .prenom(student.getPrenom())
            .email(student.getEmail())
            .niveau(student.getNiveau())
            .groupe(student.getGroupe())
            .totalBadges(student.getTotalBadges())
            .score(student.getScore())
            .photo(student.getPhoto())
            .phoneNumber("") // À ajouter si nécessaire
            .adresse("") // À ajouter si nécessaire
            .build();
    }
    
    /**
     * Récupère le profil d'un enseignant
     */
    public EnseignantProfileDto getEnseignantProfile(Long teacherId) {
        Enseignant teacher = enseignantRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
        
        return EnseignantProfileDto.builder()
            .id(teacher.getId())
            .nom(teacher.getNom())
            .prenom(teacher.getPrenom())
            .email(teacher.getEmail())
            .departement(teacher.getDepartement())
            .specialite(teacher.getSpecialite())
            .matiereName(teacher.getMatiere() != null ? teacher.getMatiere().getNom() : "")
            .nombreGroupes(teacher.getGroupes() != null ? teacher.getGroupes().size() : 0)
            .photo(teacher.getPhoto())
            .phoneNumber("")
            .bureau("")
            .build();
    }
    
    /**
     * Change le mot de passe d'un utilisateur
     */
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        Utilisateur user = utilisateurRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Vérifier l'ancien mot de passe
        if (!passwordEncoder.matches(oldPassword, user.getMdp())) {
            throw new RuntimeException("Ancien mot de passe incorrect");
        }
        
        // Mettre à jour le mot de passe
        user.setMdp(passwordEncoder.encode(newPassword));
        utilisateurRepository.save(user);
    }
    
    /**
     * Upload une photo de profil
     */
    public void uploadProfilePhoto(Long userId, MultipartFile file) throws IOException {
        Utilisateur user = utilisateurRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        if (file.getSize() > 5242880) { // 5 MB
            throw new RuntimeException("Fichier trop volumineux (max 5 MB)");
        }
        
        user.setPhoto(file.getBytes());
        utilisateurRepository.save(user);
    }
    
    /**
     * Récupère la photo de profil
     */
    public byte[] getProfilePhoto(Long userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        return user.getPhoto() != null ? user.getPhoto() : new byte[0];
    }
    
    /**
     * Met à jour le profil étudiant
     */
    public EtudiantProfileDto updateEtudiantProfile(Long studentId, EtudiantProfileDto profileDto) {
        Etudiant student = etudiantRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
        
        // Mettre à jour les informations autorisées
        student.setNom(profileDto.getNom());
        student.setPrenom(profileDto.getPrenom());
        
        etudiantRepository.save(student);
        
        return getEtudiantProfile(studentId);
    }
    
    /**
     * Met à jour le profil enseignant
     */
    public EnseignantProfileDto updateEnseignantProfile(Long teacherId, EnseignantProfileDto profileDto) {
        Enseignant teacher = enseignantRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
        
        // Mettre à jour les informations autorisées
        teacher.setNom(profileDto.getNom());
        teacher.setPrenom(profileDto.getPrenom());
        
        enseignantRepository.save(teacher);
        
        return getEnseignantProfile(teacherId);
    }
}
