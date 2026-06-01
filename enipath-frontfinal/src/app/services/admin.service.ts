import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  DashboardStats, EtudiantSuivi, EnseignantSuivi,
  Notification, Reclamation, Message
} from '../models/auth.azza';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private headers() {
    const token = this.authService.token;
    return { Authorization: `Bearer ${token}` };
  }

  getStats(adminId: number): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.api}/dashboard/stats/${adminId}`, { headers: this.headers() });
  }

  getEtudiants(): Observable<EtudiantSuivi[]> {
    return this.http.get<EtudiantSuivi[]>(`${this.api}/dashboard/etudiants`, { headers: this.headers() });
  }

  getEnseignants(): Observable<EnseignantSuivi[]> {
    return this.http.get<EnseignantSuivi[]>(`${this.api}/dashboard/enseignants`, { headers: this.headers() });
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.api}/notifications`, { headers: this.headers() });
  }

  createNotification(data: { titre: string; contenu: string; cible: string }): Observable<Notification> {
    return this.http.post<Notification>(`${this.api}/notifications`, data, { headers: this.headers() });
  }

  deactivateNotification(id: number): Observable<void> {
    return this.http.put<void>(`${this.api}/notifications/${id}/desactiver`, {}, { headers: this.headers() });
  }

  getReclamations(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.api}/reclamations`, { headers: this.headers() });
  }

  traiterReclamation(id: number, data: { reponseAdmin: string; statut: string }): Observable<Reclamation> {
    return this.http.put<Reclamation>(`${this.api}/reclamations/${id}/traiter`, data, { headers: this.headers() });
  }

  getMessagesRecus(userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.api}/messages/recus/${userId}`, { headers: this.headers() });
  }

  getMessagesEnvoyes(userId: number): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.api}/messages/envoyes/${userId}`, { headers: this.headers() });
  }

  sendMessage(data: { expediteurId: number; destinataireId: number; sujet: string; contenu: string }): Observable<Message> {
    return this.http.post<Message>(`${this.api}/messages`, data, { headers: this.headers() });
  }

  marquerLu(id: number): Observable<void> {
    return this.http.put<void>(`${this.api}/messages/${id}/lu`, {}, { headers: this.headers() });
  }
}