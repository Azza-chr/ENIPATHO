import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface UploadCoursePayload {
  titre: string;
  description: string;
  pdf: File;
  matiereId?: number; // ✅ optionnel — lie le cours à une matière
}

export interface CreateCourseQuizPayload {
  titre: string;
  description: string;
  durationMinutes: number;
  passingScore: number;
}

export interface CreateQuestionPayload {
  enonce: string;
  explication: string;
  ordre: number;
  points: number;
  choices: Array<{
    label: string;
    ordre: number;
    correct: boolean;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1`;

  uploadCourse(enseignantId: number, groupeId: number, payload: UploadCoursePayload): Observable<unknown> {
    const formData = new FormData();
    formData.append('titre', payload.titre);
    formData.append('description', payload.description);
    formData.append('pdf', payload.pdf);

    // ✅ Ajouter matiereId si fourni
    if (payload.matiereId && payload.matiereId > 0) {
      formData.append('matiereId', String(payload.matiereId));
    }

    return this.http.post(
      `${this.apiUrl}/enseignants/${enseignantId}/groupes/${groupeId}/cours`,
      formData
    );
  }

  createCourseQuiz(coursId: number, payload: CreateCourseQuizPayload): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/cours/${coursId}/quiz`, payload);
  }

  createQuestion(quizId: number, payload: CreateQuestionPayload): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/quizzes/${quizId}/questions`, payload);
  }

  deleteCourse(coursId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/cours/${coursId}`);
  }

  deleteQuiz(quizId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/quizzes/${quizId}`);
  }
}