package com.example.enipath.service;

import com.example.enipath.dto.GroupeStatisticsDto;
import com.example.enipath.dto.StudentStatisticsDto;
import com.example.enipath.model.Users.Enseignant;
import com.example.enipath.model.Users.Etudiant;
import com.example.enipath.model.academic.Groupe;
import com.example.enipath.repository.EnseignantRepository;
import com.example.enipath.repository.EtudiantRepository;
import com.example.enipath.repository.GroupeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StatisticsService {
    
    @Autowired
    private EtudiantRepository etudiantRepository;
    
    @Autowired
    private EnseignantRepository enseignantRepository;
    
    @Autowired
    private GroupeRepository groupeRepository;
    
    /**
     * Récupère les statistiques individuelles d'un étudiant
     */
    public StudentStatisticsDto getStudentStatistics(Long studentId) {
        Etudiant student = etudiantRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
        
        return StudentStatisticsDto.builder()
            .studentId(student.getId())
            .studentName(student.getNom() + " " + student.getPrenom())
            .studentEmail(student.getEmail())
            .niveau(student.getNiveau())
            .groupe(student.getGroupe())
            .totalBadges(student.getTotalBadges())
            .score(student.getScore())
            .attendance(calculateAttendance(student)) // À implémenter selon votre logique
            .moyenneEvaluations(calculateAverageEvaluation(student)) // À implémenter
            .status("ACTIF")
            .build();
    }
    
    /**
     * Récupère les statistiques d'un groupe (agrégées)
     */
    public GroupeStatisticsDto getGroupStatistics(Character groupe, Integer niveau) {
        List<Etudiant> students = etudiantRepository.findStudentsByGroupeAndNiveau(groupe, niveau);
        
        double moyenneScore = students.stream()
            .mapToInt(Etudiant::getScore)
            .average()
            .orElse(0.0);
        
        double moyenneBadges = students.stream()
            .mapToInt(Etudiant::getTotalBadges)
            .average()
            .orElse(0.0);
        
        int averageAttendance = students.stream()
            .mapToInt(this::calculateAttendance)
            .sum() / Math.max(students.size(), 1);
        
        List<StudentStatisticsDto> studentStats = students.stream()
            .map(this::convertToStudentStatistics)
            .collect(Collectors.toList());
        
        return GroupeStatisticsDto.builder()
            .groupe(groupe)
            .niveau(niveau)
            .totalStudents(students.size())
            .moyenneScore(moyenneScore)
            .moyenneBadges(moyenneBadges)
            .averageAttendance(averageAttendance)
            .students(studentStats)
            .build();
    }
    
    /**
     * Récupère toutes les statistiques des groupes d'un enseignant (sans détails des étudiants)
     */
    public List<GroupeStatisticsDto> getTeacherGroupsStatistics(Long teacherId) {
        Enseignant teacher = enseignantRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
        
        return teacher.getGroupes().stream()
            .map(groupe -> getGroupStatisticsAggregated(groupe.getCode(), groupe.getNiveau()))
            .collect(Collectors.toList());
    }
    
    /**
     * Statistiques agrégées d'un groupe (sans détails des étudiants)
     */
    public GroupeStatisticsDto getGroupStatisticsAggregated(Character groupe, Integer niveau) {
        List<Etudiant> students = etudiantRepository.findStudentsByGroupeAndNiveau(groupe, niveau);
        
        double moyenneScore = students.stream()
            .mapToInt(Etudiant::getScore)
            .average()
            .orElse(0.0);
        
        double moyenneBadges = students.stream()
            .mapToInt(Etudiant::getTotalBadges)
            .average()
            .orElse(0.0);
        
        int averageAttendance = students.stream()
            .mapToInt(this::calculateAttendance)
            .sum() / Math.max(students.size(), 1);
        
        return GroupeStatisticsDto.builder()
            .groupe(groupe)
            .niveau(niveau)
            .totalStudents(students.size())
            .moyenneScore(moyenneScore)
            .moyenneBadges(moyenneBadges)
            .averageAttendance(averageAttendance)
            .students(null) // Pas de détails pour le chef de département
            .build();
    }
    
    /**
     * Récupère les statistiques de TOUS les groupes pour un chef de département
     */
    public List<GroupeStatisticsDto> getDepartmentGroupsStatistics() {
        return groupeRepository.findAll().stream()
            .map(groupe -> getGroupStatisticsAggregated(groupe.getCode(), groupe.getNiveau()))
            .collect(Collectors.toList());
    }
    
    /**
     * Statistiques des étudiants d'un enseignant (pour les professeurs)
     */
    public List<StudentStatisticsDto> getTeacherStudentsStatistics(Long teacherId) {
        Enseignant teacher = enseignantRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Enseignant non trouvé"));
        
        // Récupérer tous les étudiants de l'enseignant
        List<Etudiant> students = etudiantRepository.findByEnseignants_Id(teacherId);
        
        return students.stream()
            .map(this::convertToStudentStatistics)
            .collect(Collectors.toList());
    }
    
    // === MÉTHODES UTILITAIRES ===
    
    private StudentStatisticsDto convertToStudentStatistics(Etudiant student) {
        return StudentStatisticsDto.builder()
            .studentId(student.getId())
            .studentName(student.getNom() + " " + student.getPrenom())
            .studentEmail(student.getEmail())
            .niveau(student.getNiveau())
            .groupe(student.getGroupe())
            .totalBadges(student.getTotalBadges())
            .score(student.getScore())
            .attendance(calculateAttendance(student))
            .moyenneEvaluations(calculateAverageEvaluation(student))
            .status("ACTIF")
            .build();
    }
    
    private int calculateAttendance(Etudiant student) {
        // À implémenter selon votre logique (recalculer à partir des données d'assiduité)
        return 85; // Valeur par défaut
    }
    
    private double calculateAverageEvaluation(Etudiant student) {
        // À implémenter selon votre logique d'évaluation
        return student.getScore() / 100.0 * 20; // Conversion sur 20
    }
}
