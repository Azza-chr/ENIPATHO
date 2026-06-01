import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import {
  AppRole,
  AuthSession
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly storageKey = 'enipath.session';

  private readonly router = inject(Router);

  private readonly sessionSubject = new BehaviorSubject<AuthSession | null>(this.restoreSession());
  readonly session$ = this.sessionSubject.asObservable();

  get session(): AuthSession | null {
    return this.sessionSubject.value;
  }

  get isAuthenticated(): boolean {
    return Boolean(this.session);
  }

  get token(): string | null {
    return this.session?.token ?? null;
  }

  logout(): void {
    localStorage.removeItem(AuthService.storageKey);
    const session = this.createLocalSession('etudiant');
    localStorage.setItem(AuthService.storageKey, JSON.stringify(session));
    this.sessionSubject.next(session);
    void this.router.navigate(['/etudiant'], { replaceUrl: true });
  }

  updateSession(partial: Partial<AuthSession>): void {
    const current = this.session ?? this.createLocalSession(partial.role ?? 'etudiant');

    const next = { ...current, ...partial };
    localStorage.setItem(AuthService.storageKey, JSON.stringify(next));
    this.sessionSubject.next(next);
  }

  activateRole(role: AppRole): void {
    const current = this.session;
    if (current?.role === role) {
      return;
    }

    const next = this.createLocalSession(role);
    localStorage.setItem(AuthService.storageKey, JSON.stringify(next));
    this.sessionSubject.next(next);
  }

  private restoreSession(): AuthSession | null {
    const raw = localStorage.getItem(AuthService.storageKey);
    if (!raw) {
      return this.createLocalSession('etudiant');
    }

    try {
      const parsed = JSON.parse(raw) as Partial<AuthSession>;
      if (!parsed.role || !parsed.email || !parsed.fullName || !parsed.redirectTo) {
        return this.createLocalSession('etudiant');
      }

      if (parsed.expiresAt && Number(parsed.expiresAt) <= Date.now()) {
        localStorage.removeItem(AuthService.storageKey);
        return this.createLocalSession('etudiant');
      }

      return {
        id: parsed.id,
        role: parsed.role,
        email: parsed.email,
        fullName: parsed.fullName,
        subtitle: parsed.subtitle ?? '',
        redirectTo: parsed.redirectTo,
        niveau: this.toStudentLevel(parsed.niveau),
        grp: this.toStudentGroup(parsed.grp),
        filiere: parsed.filiere,
        departement: parsed.departement,
        specialite: parsed.specialite,
        photoUrl: parsed.photoUrl,
        telephone: parsed.telephone,
        token: parsed.token,
        expiresAt: parsed.expiresAt
      };
    } catch {
      return this.createLocalSession('etudiant');
    }
  }

  private redirectForRole(role: AppRole): string {
    const redirects: Record<AppRole, string> = {
      etudiant: '/etudiant',
      enseignant: '/enseignant',
      'chef-departement': '/chef-departement'
    };

    return redirects[role];
  }

  private roleLabel(role: AppRole): string {
    const labels: Record<AppRole, string> = {
      etudiant: 'Espace etudiant',
      enseignant: 'Espace enseignant',
      'chef-departement': 'Espace chef de departement'
    };

    return labels[role];
  }

  private localNameForRole(role: AppRole): string {
    const names: Record<AppRole, string> = {
      etudiant: 'Etudiant ENIPATH',
      enseignant: 'Professeur ENIPATH',
      'chef-departement': 'Chef de departement ENIPATH'
    };

    return names[role];
  }

  private createLocalSession(role: AppRole): AuthSession {
    return {
      role,
      email: `${role}@enipath.tn`,
      fullName: this.localNameForRole(role),
      subtitle: this.roleLabel(role),
      redirectTo: this.redirectForRole(role),
      niveau: role === 'etudiant' ? 2 : undefined,
      grp: role === 'etudiant' ? 'A' : undefined,
      filiere: role === 'etudiant' ? 'Informatique' : undefined,
      departement: role !== 'etudiant' ? 'Informatique' : undefined,
      specialite: role === 'enseignant' ? 'Pedagogie numerique' : undefined
    };
  }

  private toStudentLevel(value: unknown): 1 | 2 | 3 | undefined {
    const numeric = Number(value);
    return numeric === 1 || numeric === 2 || numeric === 3 ? numeric : undefined;
  }

  private toStudentGroup(value: unknown): 'A' | 'B' | 'C' | 'D' | undefined {
    return value === 'A' || value === 'B' || value === 'C' || value === 'D' ? value : undefined;
  }
}
