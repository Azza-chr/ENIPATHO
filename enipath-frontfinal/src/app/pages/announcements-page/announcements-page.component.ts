// Role: announcements page — loads annonces + notifications + messages for all roles.
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AppRole } from '../../models/auth.models';
import { Announcement, AnnouncementAudience } from '../../models/communication.models';
import { AuthService } from '../../services/auth.service';
import { CommunicationService } from '../../services/communication.service';
import { environment } from '../../../environments/environment';

interface BackendAnnonce {
  id: number;
  titre: string;
  contenu: string;
  enseignantId: number;
  enseignantNom: string;
  createdAt: string;
}

interface BackendNotification {
  id: number;
  titre: string;
  contenu: string;
  cible: string;   // backend enum: ALL | ETUDIANTS | ENSEIGNANTS
  active: boolean;
  creeLe: string;
}

interface BackendMessage {
  id: number;
  sujet: string;
  contenu: string;
  expediteurNom: string;
  envoyeLe: string;
  lu: boolean;
}

interface AnnouncementWithTag extends Announcement {
  tag: 'annonce' | 'notification' | 'message';
}

@Component({
  selector: 'app-announcements-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './announcements-page.component.html',
  styleUrl: './announcements-page.component.css'
})
export class AnnouncementsPageComponent implements OnInit {
  private readonly fb            = inject(FormBuilder);
  private readonly auth          = inject(AuthService);
  private readonly communication = inject(CommunicationService);
  private readonly http          = inject(HttpClient);

  announcements: AnnouncementWithTag[] = [];
  successMessage = '';
  errorMessage   = '';
  isLoading = true;

  readonly form = this.fb.group({
    title:    ['', Validators.required],
    body:     ['', Validators.required],
    audience: ['etudiant' as AnnouncementAudience, Validators.required],
    priority: ['normal' as 'normal' | 'important' | 'urgent', Validators.required]
  });

  get session()     { return this.auth.session; }
  get canPublish(): boolean {
    return this.session?.role === 'enseignant' || this.session?.role === 'chef-departement';
  }

  get audienceOptions(): Array<{ label: string; value: string }> {
    if (this.session?.role === 'chef-departement') {
      return [
        { label: 'Tous',        value: 'tous'       },
        { label: 'Etudiants',   value: 'etudiant'   },
        { label: 'Enseignants', value: 'enseignant' }
      ];
    }
    if (this.session?.role === 'enseignant') {
      return [
        { label: 'Tous les étudiants',   value: 'etudiant'  },
        { label: 'Étudiants - Groupe A', value: 'groupe-a'  },
        { label: 'Étudiants - Groupe B', value: 'groupe-b'  },
        { label: 'Étudiants - Groupe C', value: 'groupe-c'  },
        { label: 'Étudiants - Groupe D', value: 'groupe-d'  }
      ];
    }
    return [{ label: 'Etudiants', value: 'etudiant' }];
  }

  ngOnInit(): void {
    this.loadAll();
    this.communication.announcements$.subscribe(() => this.loadAll());
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.session?.token;
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  private loadAll(): void {
    this.isLoading = true;
    const role    = this.session?.role;
    const userId  = this.session?.id;
    const api     = environment.apiUrl;
    const options = { headers: this.getAuthHeaders() };

    // ── Annonces enseignants ──────────────────────────────────────────────────
    const annonces$ = this.http
      .get<BackendAnnonce[]>(`${api}/api/v1/annonces`, options)
      .pipe(catchError(() => of([] as BackendAnnonce[])));

    // ── Notifications selon rôle ──────────────────────────────────────────────
    let notifUrl = '';
    if (role === 'etudiant')         notifUrl = `${api}/api/admin/notifications/etudiants`;
    if (role === 'enseignant')       notifUrl = `${api}/api/admin/notifications/enseignants`;
    if (role === 'chef-departement') notifUrl = `${api}/api/admin/notifications/actives`;

    const notifs$ = notifUrl
      ? this.http.get<BackendNotification[]>(notifUrl, options)
          .pipe(catchError(() => of([] as BackendNotification[])))
      : of([] as BackendNotification[]);

    // ── Messages reçus (endpoint backend correct) ─────────────────────────────
    const messages$ = userId
      ? this.http
          .get<BackendMessage[]>(`${api}/api/admin/messages/recus/${userId}`, options)
          .pipe(catchError(() => of([] as BackendMessage[])))
      : of([] as BackendMessage[]);

    forkJoin({ annonces: annonces$, notifs: notifs$, messages: messages$ }).subscribe({
      next: ({ annonces, notifs, messages }) => {

        const fromAnnonces: AnnouncementWithTag[] = annonces.map(a => ({
          id:         String(a.id),
          title:      a.titre,
          body:       a.contenu,
          audience:   'tous' as AnnouncementAudience,
          priority:   'normal' as const,
          authorName: a.enseignantNom || 'Enseignant',
          authorRole: 'enseignant' as AppRole,
          createdAt:  a.createdAt,
          tag:        'annonce' as const
        }));

        const fromNotifs: AnnouncementWithTag[] = notifs
          .filter(n => n.active)
          .map(n => {
            // Backend enum: ALL | ETUDIANTS | ENSEIGNANTS (avec S)
            let audience: AnnouncementAudience = 'tous';
            if (n.cible === 'ETUDIANTS')   audience = 'etudiant';
            if (n.cible === 'ENSEIGNANTS') audience = 'enseignant';
            return {
              id:         String(n.id),
              title:      n.titre,
              body:       n.contenu,
              audience,
              priority:   'important' as const,
              authorName: 'Chef de département',
              authorRole: 'chef-departement' as AppRole,
              createdAt:  n.creeLe,
              tag:        'notification' as const
            };
          });

        const fromMessages: AnnouncementWithTag[] = messages.map(m => ({
          id:         String(m.id),
          title:      m.sujet || 'Message reçu',
          body:       m.contenu,
          audience:   (role ?? 'etudiant') as AnnouncementAudience,
          priority:   m.lu ? ('normal' as const) : ('important' as const),
          authorName: m.expediteurNom || 'Chef de département',
          authorRole: 'chef-departement' as AppRole,
          createdAt:  m.envoyeLe,
          tag:        'message' as const
        }));

        this.announcements = [...fromAnnonces, ...fromNotifs, ...fromMessages]
          .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  publish(): void {
    const session = this.session;
    if (!session || !this.canPublish || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    // Chef de département → POST direct vers /api/admin/notifications
    // avec l'enum correct: ALL | ETUDIANTS | ENSEIGNANTS
    if (session.role === 'chef-departement') {
      const audienceMap: Record<string, string> = {
        tous:       'ALL',
        etudiant:   'ETUDIANTS',
        enseignant: 'ENSEIGNANTS'
      };
      const cible = audienceMap[value.audience ?? 'tous'] ?? 'ALL';

      this.http
        .post(
          `${environment.apiUrl}/api/admin/notifications`,
          { titre: value.title, contenu: value.body, cible },
          { headers: this.getAuthHeaders() }
        )
        .pipe(catchError(err => {
          console.error('Erreur création notification:', err);
          this.errorMessage = 'Erreur lors de la publication.';
          setTimeout(() => this.errorMessage = '', 3000);
          return of(null);
        }))
        .subscribe(res => {
          if (res !== null) {
            this.successMessage = 'Notification publiée avec succès.';
            this.form.reset({ title: '', body: '', audience: 'tous', priority: 'normal' });
            setTimeout(() => { this.successMessage = ''; this.loadAll(); }, 2000);
          }
        });
      return;
    }

    // Enseignant → WebSocket / service communication
    this.communication.publishAnnouncement(session, {
      title:    value.title    ?? '',
      body:     value.body     ?? '',
      audience: value.audience ?? 'etudiant',
      priority: value.priority ?? 'normal'
    });
    this.form.reset({ title: '', body: '', audience: 'etudiant', priority: 'normal' });
    this.successMessage = 'Annonce publiée avec succès.';
    setTimeout(() => { this.successMessage = ''; this.loadAll(); }, 2000);
  }

  formatDate(value: string): string {
    if (!value) return '';
    return new Date(value).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  }

  audienceLabel(value: string): string {
    const labels: Record<string, string> = {
      tous: 'Tous', etudiant: 'Etudiants', enseignant: 'Enseignants',
      'chef-departement': 'Chef de département',
      'groupe-a': 'Groupe A', 'groupe-b': 'Groupe B',
      'groupe-c': 'Groupe C', 'groupe-d': 'Groupe D'
    };
    return labels[value] ?? value;
  }

  tagLabel(tag: string): string {
    const labels: Record<string, string> = {
      annonce:      '📢 Annonce',
      notification: '🔔 Notification',
      message:      '✉️ Message'
    };
    return labels[tag] ?? tag;
  }

  tagClass(tag: string): string {
    const classes: Record<string, string> = {
      annonce:      'tag-annonce',
      notification: 'tag-notif',
      message:      'tag-message'
    };
    return classes[tag] ?? '';
  }

  isNew(item: AnnouncementWithTag): boolean {
    const createdAt = Date.parse(item.createdAt);
    return item.priority === 'important' || item.priority === 'urgent' ||
      (Number.isFinite(createdAt) && Date.now() - createdAt <= 7 * 24 * 60 * 60 * 1000);
  }
}