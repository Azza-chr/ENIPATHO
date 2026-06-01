import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AppRole } from '../../models/auth.models';
import { Announcement, AnnouncementAudience } from '../../models/communication.models';
import { AuthService } from '../../services/auth.service';
import { CommunicationService } from '../../services/communication.service';

@Component({
  selector: 'app-announcements-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './announcements-page.component.html',
  styleUrl: './announcements-page.component.css'
})
export class AnnouncementsPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly communication = inject(CommunicationService);

  announcements: Announcement[] = [];
  successMessage = '';

  readonly form = this.fb.group({
    title: ['', Validators.required],
    body: ['', Validators.required],
    audience: ['etudiant' as AnnouncementAudience, Validators.required],
    priority: ['normal' as 'normal' | 'important' | 'urgent', Validators.required]
  });

  get session() {
    return this.auth.session;
  }

  get canPublish(): boolean {
    return this.session?.role === 'enseignant' || this.session?.role === 'chef-departement';
  }

  get audienceOptions(): Array<{ label: string; value: string }> {
    if (this.session?.role === 'chef-departement') {
      return [
        { label: 'Tous', value: 'tous' },
        { label: 'Etudiants', value: 'etudiant' },
        { label: 'Enseignants', value: 'enseignant' }
      ];
    }

    if (this.session?.role === 'enseignant') {
      return [
        { label: 'Tous les étudiants', value: 'etudiant' },
        { label: 'Étudiants - Groupe A', value: 'groupe-a' },
        { label: 'Étudiants - Groupe B', value: 'groupe-b' },
        { label: 'Étudiants - Groupe C', value: 'groupe-c' },
        { label: 'Étudiants - Groupe D', value: 'groupe-d' }
      ];
    }

    return [{ label: 'Etudiants', value: 'etudiant' }];
  }

  ngOnInit(): void {
    this.refresh();
    this.communication.announcements$.subscribe(() => this.refresh());
  }

  publish(): void {
    const session = this.session;
    if (!session || !this.canPublish || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.communication.publishAnnouncement(session, {
      title: value.title ?? '',
      body: value.body ?? '',
      audience: value.audience ?? 'etudiant',
      priority: value.priority ?? 'normal'
    });

    this.form.reset({
      title: '',
      body: '',
      audience: this.session?.role === 'chef-departement' ? 'tous' : 'etudiant',
      priority: 'normal'
    });
    this.successMessage = 'Annonce publiee avec succes.';
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }

  audienceLabel(value: string): string {
    const labels: Record<string, string> = {
      tous: 'Tous',
      etudiant: 'Etudiants',
      enseignant: 'Enseignants',
      'chef-departement': 'Chef de departement',
      'groupe-a': 'Groupe A',
      'groupe-b': 'Groupe B',
      'groupe-c': 'Groupe C',
      'groupe-d': 'Groupe D'
    };

    return labels[value] ?? value;
  }

  isNew(item: Announcement): boolean {
    const createdAt = Date.parse(item.createdAt);
    return item.priority !== 'normal' || (Number.isFinite(createdAt) && Date.now() - createdAt <= 7 * 24 * 60 * 60 * 1000);
  }

  private refresh(): void {
    if (!this.session) {
      this.announcements = [];
      return;
    }

    this.announcements = this.communication.announcementsFor(this.session);
  }
}
