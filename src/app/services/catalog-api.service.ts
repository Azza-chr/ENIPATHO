import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Chapitre, CoursPdf, Groupe, Matiere, Ressource, Semestre } from '../models/catalog.models';

@Injectable({
  providedIn: 'root'
})
export class CatalogApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly apiRoot = this.apiUrl.replace(/\/api\/v1$/, '');

  getSemestres(): Observable<Semestre[]> {
    return this.http.get<unknown>(`${this.apiUrl}/semestres`).pipe(
      map((payload) =>
        this.extractArray(payload)
          .map((item, index) => this.toSemestre(item, index))
          .sort((left, right) => left.ordre - right.ordre)
      )
    );
  }

  getMatieresBySemestre(semestreId: number): Observable<Matiere[]> {
    return this.http.get<unknown>(`${this.apiUrl}/semestres/${semestreId}/matieres`).pipe(
      map((payload) => this.extractArray(payload).map((item) => this.toMatiere(item, semestreId)))
    );
  }

  getMatiere(matiereId: number): Observable<Matiere> {
    return this.http.get<unknown>(`${this.apiUrl}/matieres/${matiereId}`).pipe(
      map((payload) => this.toMatiere(this.extractItem(payload), undefined, matiereId))
    );
  }

  getChapitresByMatiere(matiereId: number): Observable<Chapitre[]> {
    return this.http.get<unknown>(`${this.apiUrl}/matieres/${matiereId}/chapitres`).pipe(
      map((payload) =>
        this.extractArray(payload)
          .map((item, index) => this.toChapitre(item, index))
          .sort((left, right) => left.ordre - right.ordre)
      )
    );
  }

  getChapitre(chapitreId: number): Observable<Chapitre> {
    return this.http.get<unknown>(`${this.apiUrl}/chapitres/${chapitreId}`).pipe(
      map((payload) => this.toChapitre(this.extractItem(payload), 0, chapitreId))
    );
  }

  getCoursByMatiere(matiereId: number): Observable<CoursPdf[]> {
    return this.http.get<unknown>(`${this.apiUrl}/matieres/${matiereId}/cours`).pipe(
      map((payload) =>
        this.extractArray(payload).map((item, index) => this.toCours(item, matiereId, index))
      )
    );
  }

  getCoursByEnseignant(enseignantId: number): Observable<CoursPdf[]> {
    return this.http.get<unknown>(`${this.apiUrl}/enseignants/${enseignantId}/cours`).pipe(
      map((payload) =>
        this.extractArray(payload).map((item, index) => this.toCours(item, 0, index))
      )
    );
  }

  getGroupes(): Observable<Groupe[]> {
    return this.http.get<unknown>(`${this.apiUrl}/groupes`).pipe(
      map((payload) =>
        this.extractArray(payload).map((item) => ({
          id: this.toNumber(item['id'], 0),
          nom: this.toText(item['nom'], 'Groupe'),
          niveau: this.toOptionalText(item['niveau']),
          filiere: this.toOptionalText(item['filiere'])
        }))
      )
    );
  }

  private extractArray(payload: unknown): Record<string, unknown>[] {
    if (Array.isArray(payload)) {
      return payload as Record<string, unknown>[];
    }

    if (!payload || typeof payload !== 'object') {
      return [];
    }

    const source = payload as Record<string, unknown>;
    const candidate = [source['content'], source['items'], source['value'], source['data'], source['results']].find(
      Array.isArray
    );

    return (candidate as Record<string, unknown>[] | undefined) ?? [];
  }

  private extractItem(payload: unknown): Record<string, unknown> {
    if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
      const source = payload as Record<string, unknown>;
      const nested = [source['data'], source['item'], source['result']].find(
        (candidate) => candidate && typeof candidate === 'object' && !Array.isArray(candidate)
      );

      return (nested as Record<string, unknown> | undefined) ?? source;
    }

    return {};
  }

  private toSemestre(source: Record<string, unknown>, index: number): Semestre {
    const ordre = this.toNumber(source['ordre'], index + 1);

    return {
      id: this.toNumber(source['id'], index + 1),
      code: this.toOptionalText(source['code']),
      nom: this.toText(source['libelle'] ?? source['nom'], `Semestre ${ordre}`),
      ordre,
      matieres: this.extractArray(source['matieres']).map((item) =>
        this.toMatiere(item, this.toNumber(source['id'], 0))
      )
    };
  }

  private toMatiere(source: Record<string, unknown>, semestreId?: number, fallbackId?: number): Matiere {
    return {
      id: this.toNumber(source['id'], fallbackId ?? 0),
      code: this.toOptionalText(source['code']),
      nom: this.toText(source['nom'], 'Matiere'),
      description: this.toText(source['description'], 'Aucune description disponible.'),
      semestreId: this.toNumber(source['semestreId'], semestreId ?? 0),
      semestreLibelle: this.toOptionalText(source['semestreLibelle']),
      enseignant: this.toOptionalText(source['enseignantNom']),
      chapitres: this.extractArray(source['chapitres']).map((item, index) => this.toChapitre(item, index))
    };
  }

  private toChapitre(source: Record<string, unknown>, index: number, fallbackId?: number): Chapitre {
    const quiz = this.extractItem(source['quiz']);

    return {
      id: this.toNumber(source['id'], fallbackId ?? index + 1),
      titre: this.toText(source['titre'], `Chapitre ${index + 1}`),
      description: this.toText(source['description'], 'Aucune description disponible.'),
      ordre: this.toNumber(source['ordre'], index + 1),
      published: this.toBoolean(source['published']),
      ressources: this.extractArray(source['ressources']).map((item, resourceIndex) =>
        this.toRessource(item, resourceIndex)
      ),
      quiz: quiz['id']
        ? {
            id: this.toNumber(quiz['id'], 0),
            titre: this.toText(quiz['titre'], 'Quiz'),
            description: this.toOptionalText(quiz['description']),
            durationMinutes: this.toOptionalNumber(quiz['durationMinutes']),
            passingScore: this.toOptionalNumber(quiz['passingScore'])
          }
        : undefined,
      quizId: this.toOptionalNumber(quiz['id'])
    };
  }

  private toRessource(source: Record<string, unknown>, index: number): Ressource {
    return {
      id: this.toNumber(source['id'], index + 1),
      titre: this.toText(source['titre'], `Ressource ${index + 1}`),
      type: this.toText(source['type'], 'COURS'),
      url: this.toOptionalText(source['fileUrl']),
      description: this.toOptionalText(source['description']),
      mimeType: this.toOptionalText(source['mimeType'])
    };
  }

  private toCours(source: Record<string, unknown>, matiereId: number, index: number): CoursPdf {
    return {
      id: this.toNumber(source['id'], index + 1),
      titre: this.toText(source['titre'], 'Cours'),
      description: this.toText(source['description'], 'Cours PDF'),
      originalFileName: this.toText(source['originalFileName'], 'cours.pdf'),
      fileSize: this.toOptionalNumber(source['fileSize']),
      createdAt: this.toOptionalText(source['createdAt']),
      matiereId: this.toNumber(source['matiereId'], matiereId),
      quizId: this.toOptionalNumber(source['quizId']),
      viewUrl: this.resolveUrl(this.toText(source['viewUrl'], '')),
      downloadUrl: this.resolveUrl(this.toText(source['downloadUrl'], ''))
    };
  }

  private resolveUrl(value: string): string {
    if (!value) {
      return '';
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    return `${this.apiRoot}${value}`;
  }

  private toText(value: unknown, fallback: string): string {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  private toOptionalText(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  }

  private toNumber(value: unknown, fallback: number): number {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : fallback;
  }

  private toOptionalNumber(value: unknown): number | undefined {
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : undefined;
  }

  private toBoolean(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') {
      return value;
    }

    if (value === 1 || value === '1') {
      return true;
    }

    if (value === 0 || value === '0') {
      return false;
    }

    return undefined;
  }
}
