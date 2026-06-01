package com.example.enipath.controller;

import com.example.enipath.model.Users.Utilisateur;
import com.example.enipath.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/utilisateurs")
@CrossOrigin(origins = "*") // Pour éviter les problèmes CORS avec Postman
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    @Autowired
    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    // ✅ GET - Tous les utilisateurs
    @GetMapping
    public ResponseEntity<List<Utilisateur>> getAllUtilisateurs() {
        return ResponseEntity.ok(utilisateurService.findAll());
    }

    // ✅ GET - Utilisateurs actifs/inactifs
    @GetMapping("/actifs")
    public ResponseEntity<List<Utilisateur>> getByActif(@RequestParam Boolean actif) {
        return ResponseEntity.ok(utilisateurService.findByActif(actif));
    }

    // ✅ GET - Par email
    @GetMapping("/email/{email}")
    public ResponseEntity<Utilisateur> getByEmail(@PathVariable String email) {
        return utilisateurService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ PUT - Toggle actif
    @PutMapping("/{id}/toggle")
    public ResponseEntity<String> toggleActif(@PathVariable Long id) {
        utilisateurService.toggleActif(id);
        return ResponseEntity.ok("Statut utilisateur mis à jour");
    }

    // ✅ PUT - Changer mot de passe
    @PutMapping("/{id}/password")
    public ResponseEntity<String> changerMotDePasse(
            @PathVariable Long id,
            @RequestBody PasswordChangeRequest request) {

        utilisateurService.changerMotDePasse(id, request.ancienMdp(), request.nouveauMdp());
        return ResponseEntity.ok("Mot de passe mis à jour avec succès");
    }

    // ✅ DELETE - Supprimer utilisateur
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUtilisateur(@PathVariable Long id) {
        utilisateurService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

// 🔹 DTO simple pour le changement de mot de passe (record Java 17+)
record PasswordChangeRequest(String ancienMdp, String nouveauMdp) {}