import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EtudiantProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  niveau: number;
  groupe: string;
  totalBadges: number;
  score: number;
  photo?: Blob;
  phoneNumber?: string;
  adresse?: string;
}

export interface EnseignantProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  departement: string;
  specialite: string;
  matiereName: string;
  nombreGroupes: number;
  photo?: Blob;
  phoneNumber?: string;
  bureau?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private apiUrl = 'http://localhost:8081/api/profile';

  constructor(private http: HttpClient) { }

  /**
   * Récupère le profil d'un étudiant
   */
  getStudentProfile(studentId: number): Observable<EtudiantProfile> {
    return this.http.get<EtudiantProfile>(`${this.apiUrl}/student/${studentId}`);
  }

  /**
   * Récupère le profil d'un enseignant
   */
  getTeacherProfile(teacherId: number): Observable<EnseignantProfile> {
    return this.http.get<EnseignantProfile>(`${this.apiUrl}/teacher/${teacherId}`);
  }

  /**
   * Change le mot de passe
   */
  changePassword(userId: number, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/change-password`, {
      oldPassword,
      newPassword
    });
  }

  /**
   * Upload une photo de profil
   */
  uploadProfilePhoto(userId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${userId}/upload-photo`, formData);
  }

  /**
   * Récupère la photo de profil
   */
  getProfilePhoto(userId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${userId}/photo`, { responseType: 'blob' });
  }

  /**
   * Met à jour le profil d'un étudiant
   */
  updateStudentProfile(studentId: number, profile: EtudiantProfile): Observable<EtudiantProfile> {
    return this.http.put<EtudiantProfile>(`${this.apiUrl}/student/${studentId}`, profile);
  }

  /**
   * Met à jour le profil d'un enseignant
   */
  updateTeacherProfile(teacherId: number, profile: EnseignantProfile): Observable<EnseignantProfile> {
    return this.http.put<EnseignantProfile>(`${this.apiUrl}/teacher/${teacherId}`, profile);
  }
}
