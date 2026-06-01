package com.example.enipath.controller;

import com.example.enipath.dto.EtudiantProfileDto;
import com.example.enipath.dto.EnseignantProfileDto;
import com.example.enipath.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:4200")
public class ProfileController {
    
    @Autowired
    private ProfileService profileService;
    
    /**
     * Récupère le profil d'un étudiant
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<EtudiantProfileDto> getStudentProfile(@PathVariable Long studentId) {
        try {
            EtudiantProfileDto profile = profileService.getEtudiantProfile(studentId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Récupère le profil d'un enseignant
     */
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<EnseignantProfileDto> getTeacherProfile(@PathVariable Long teacherId) {
        try {
            EnseignantProfileDto profile = profileService.getEnseignantProfile(teacherId);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Change le mot de passe d'un utilisateur
     */
    @PostMapping("/{userId}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long userId,
            @RequestBody Map<String, String> request) {
        try {
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");
            
            profileService.changePassword(userId, oldPassword, newPassword);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Mot de passe modifié avec succès");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Upload une photo de profil
     */
    @PostMapping("/{userId}/upload-photo")
    public ResponseEntity<?> uploadProfilePhoto(
            @PathVariable Long userId,
            @RequestParam("file") MultipartFile file) {
        try {
            profileService.uploadProfilePhoto(userId, file);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Photo téléchargée avec succès");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Erreur lors du téléchargement de la photo: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
    
    /**
     * Récupère la photo de profil
     */
    @GetMapping("/{userId}/photo")
    public ResponseEntity<byte[]> getProfilePhoto(@PathVariable Long userId) {
        try {
            byte[] photo = profileService.getProfilePhoto(userId);
            return ResponseEntity.ok()
                    .header("Content-Type", "image/jpeg")
                    .body(photo);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Met à jour le profil d'un étudiant
     */
    @PutMapping("/student/{studentId}")
    public ResponseEntity<EtudiantProfileDto> updateStudentProfile(
            @PathVariable Long studentId,
            @RequestBody EtudiantProfileDto profileDto) {
        try {
            EtudiantProfileDto updated = profileService.updateEtudiantProfile(studentId, profileDto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Met à jour le profil d'un enseignant
     */
    @PutMapping("/teacher/{teacherId}")
    public ResponseEntity<EnseignantProfileDto> updateTeacherProfile(
            @PathVariable Long teacherId,
            @RequestBody EnseignantProfileDto profileDto) {
        try {
            EnseignantProfileDto updated = profileService.updateEnseignantProfile(teacherId, profileDto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
