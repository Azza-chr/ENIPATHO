package com.example.enipath.controller;

import com.example.enipath.dto.GroupeStatisticsDto;
import com.example.enipath.dto.StudentStatisticsDto;
import com.example.enipath.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "http://localhost:4200")
public class StatisticsController {
    
    @Autowired
    private StatisticsService statisticsService;
    
    /**
     * Récupère les statistiques d'un étudiant (pour les professeurs)
     */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<StudentStatisticsDto> getStudentStatistics(@PathVariable Long studentId) {
        try {
            StudentStatisticsDto stats = statisticsService.getStudentStatistics(studentId);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Récupère les statistiques d'un groupe (agrégées - pour les chefs de département)
     */
    @GetMapping("/groupe/{groupe}/{niveau}")
    public ResponseEntity<GroupeStatisticsDto> getGroupStatistics(
            @PathVariable Character groupe,
            @PathVariable Integer niveau) {
        try {
            GroupeStatisticsDto stats = statisticsService.getGroupStatisticsAggregated(groupe, niveau);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Récupère les statistiques d'un groupe avec détails des étudiants (pour les professeurs)
     */
    @GetMapping("/groupe/{groupe}/{niveau}/detailed")
    public ResponseEntity<GroupeStatisticsDto> getGroupStatisticsDetailed(
            @PathVariable Character groupe,
            @PathVariable Integer niveau) {
        try {
            GroupeStatisticsDto stats = statisticsService.getGroupStatistics(groupe, niveau);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Récupère les statistiques de TOUS les groupes (pour les chefs de département)
     */
    @GetMapping("/department")
    public ResponseEntity<List<GroupeStatisticsDto>> getDepartmentStatistics() {
        try {
            List<GroupeStatisticsDto> stats = statisticsService.getDepartmentGroupsStatistics();
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Récupère les statistiques des groupes d'un enseignant (sans détails des étudiants)
     */
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<GroupeStatisticsDto>> getTeacherGroupsStatistics(@PathVariable Long teacherId) {
        try {
            List<GroupeStatisticsDto> stats = statisticsService.getTeacherGroupsStatistics(teacherId);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Récupère les statistiques des étudiants d'un enseignant (avec détails)
     */
    @GetMapping("/teacher/{teacherId}/students")
    public ResponseEntity<List<StudentStatisticsDto>> getTeacherStudentsStatistics(@PathVariable Long teacherId) {
        try {
            List<StudentStatisticsDto> stats = statisticsService.getTeacherStudentsStatistics(teacherId);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
