import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, from, map, of, tap, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { AuthSession, UserProfile } from '../models/auth.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;

  getCurrentProfile(): Observable<UserProfile> {
    return this.http.get<unknown>(`${this.apiUrl}/users/me`).pipe(
      map((payload) => this.toProfile(this.extractItem(payload))),
      tap((profile) => this.auth.updateSession(profile)),
      catchError((error: HttpErrorResponse) => {
        if (this.canUseLocalFallback(error)) {
          return of(this.sessionProfile());
        }

        return throwError(() => new Error('Impossible de charger le profil depuis la base.'));
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http
      .put<void>(`${this.apiUrl}/users/me/password`, {
        currentPassword,
        newPassword
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (this.canUseLocalFallback(error)) {
            return of(undefined);
          }

          return throwError(() => new Error('Mot de passe non modifie. Verifiez le mot de passe actuel.'));
        })
      );
  }

  uploadPhoto(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('photo', file);

    return this.http.post<unknown>(`${this.apiUrl}/users/me/photo`, formData).pipe(
      map((payload) => {
        const source = this.extractItem(payload);
        return this.toText(source['photoUrl'] ?? source['avatarUrl'] ?? source['url'], '');
      }),
      tap((photoUrl) => {
        if (photoUrl) {
          this.auth.updateSession({ photoUrl });
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (this.canUseLocalFallback(error)) {
          return from(this.fileToDataUrl(file)).pipe(
            tap((photoUrl) => this.auth.updateSession({ photoUrl }))
          );
        }

        return throwError(() => new Error('Photo non envoyee. Reessayez avec une image valide.'));
      })
    );
  }

  private sessionProfile(): UserProfile {
    const session = this.auth.session;
    if (!session) {
      throw new Error('Aucun utilisateur connecte.');
    }

    return {
      ...session,
      statut: 'Actif'
    };
  }

  private toProfile(source: Record<string, unknown>): UserProfile {
    const session = this.auth.session;
    const role = session?.role ?? 'etudiant';
    const profile: UserProfile = {
      id: this.toOptionalNumber(source['id']) ?? session?.id,
      role,
      email: this.toText(source['email'], session?.email ?? ''),
      fullName: this.toText(
        source['fullName'] ?? source['nomComplet'] ?? source['name'],
        session?.fullName ?? 'Utilisateur ENIPATH'
      ),
      subtitle: this.toText(source['subtitle'] ?? source['titre'], session?.subtitle ?? ''),
      redirectTo: session?.redirectTo ?? this.redirectForRole(role),
      niveau: this.toStudentLevel(source['niveau']) ?? session?.niveau,
      grp: this.toStudentGroup(source['grp'] ?? source['groupe']) ?? session?.grp,
      filiere: this.toOptionalText(source['filiere']) ?? session?.filiere,
      departement: this.toOptionalText(source['departement']) ?? session?.departement,
      specialite: this.toOptionalText(source['specialite']) ?? session?.specialite,
      photoUrl:
        this.toOptionalText(source['photoUrl'] ?? source['avatarUrl'] ?? source['urlPhoto']) ??
        session?.photoUrl,
      telephone: this.toOptionalText(source['telephone']) ?? session?.telephone,
      token: session?.token,
      expiresAt: session?.expiresAt,
      statut: this.toOptionalText(source['statut']) ?? 'Actif',
      createdAt: this.toOptionalText(source['createdAt'])
    };

    return profile;
  }

  private extractItem(payload: unknown): Record<string, unknown> {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      const source = payload as Record<string, unknown>;
      const nested = [source['data'], source['item'], source['result'], source['user']].find(
        (candidate) => candidate && typeof candidate === 'object' && !Array.isArray(candidate)
      );

      return (nested as Record<string, unknown> | undefined) ?? source;
    }

    return {};
  }

  private canUseLocalFallback(error: HttpErrorResponse): boolean {
    return environment.allowLocalAuthFallback && [0, 403, 404, 405].includes(error.status);
  }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Lecture image impossible.'));
      reader.readAsDataURL(file);
    });
  }

  private redirectForRole(role: AuthSession['role']): string {
    const redirects: Record<AuthSession['role'], string> = {
      etudiant: '/etudiant',
      enseignant: '/enseignant',
      'chef-departement': '/chef-departement'
    };

    return redirects[role];
  }

  private toText(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  private toOptionalText(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private toOptionalNumber(value: unknown): number | undefined {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  private toStudentLevel(value: unknown): 1 | 2 | 3 | undefined {
    const numeric = Number(value);
    return numeric === 1 || numeric === 2 || numeric === 3 ? numeric : undefined;
  }

  private toStudentGroup(value: unknown): 'A' | 'B' | 'C' | 'D' | undefined {
    return value === 'A' || value === 'B' || value === 'C' || value === 'D' ? value : undefined;
  }
}
