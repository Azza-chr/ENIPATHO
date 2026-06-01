import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentStatistics {
  studentId: number;
  studentName: string;
  studentEmail: string;
  niveau: number;
  groupe: string;
  totalBadges: number;
  score: number;
  attendance: number;
  moyenneEvaluations: number;
  status: string;
}

export interface GroupeStatistics {
  groupe: string;
  niveau: number;
  totalStudents: number;
  moyenneScore: number;
  moyenneBadges: number;
  averageAttendance: number;
  students?: StudentStatistics[];
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  private apiUrl = 'http://localhost:8081/api/statistics';

  constructor(private http: HttpClient) { }

  /**
   * Récupère les statistiques d'un étudiant (pour les professeurs)
   */
  getStudentStatistics(studentId: number): Observable<StudentStatistics> {
    return this.http.get<StudentStatistics>(`${this.apiUrl}/student/${studentId}`);
  }

  /**
   * Récupère les statistiques agrégées d'un groupe (pour les chefs)
   */
  getGroupStatistics(groupe: string, niveau: number): Observable<GroupeStatistics> {
    return this.http.get<GroupeStatistics>(`${this.apiUrl}/groupe/${groupe}/${niveau}`);
  }

  /**
   * Récupère les statistiques d'un groupe avec détails des étudiants (pour les profs)
   */
  getGroupStatisticsDetailed(groupe: string, niveau: number): Observable<GroupeStatistics> {
    return this.http.get<GroupeStatistics>(`${this.apiUrl}/groupe/${groupe}/${niveau}/detailed`);
  }

  /**
   * Récupère les statistiques de tous les groupes du département (pour les chefs)
   */
  getDepartmentStatistics(): Observable<GroupeStatistics[]> {
    return this.http.get<GroupeStatistics[]>(`${this.apiUrl}/department`);
  }

  /**
   * Récupère les statistiques des groupes d'un enseignant (sans détails)
   */
  getTeacherGroupsStatistics(teacherId: number): Observable<GroupeStatistics[]> {
    return this.http.get<GroupeStatistics[]>(`${this.apiUrl}/teacher/${teacherId}`);
  }

  /**
   * Récupère les statistiques des étudiants d'un enseignant (avec détails)
   */
  getTeacherStudentsStatistics(teacherId: number): Observable<StudentStatistics[]> {
    return this.http.get<StudentStatistics[]>(`${this.apiUrl}/teacher/${teacherId}/students`);
  }
}
