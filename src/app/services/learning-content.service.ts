import { Injectable, inject } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';

import { Chapitre, CoursPdf, Matiere, Semestre } from '../models/catalog.models';
import { QuizDetail } from '../models/quiz.models';
import { CatalogApiService } from './catalog-api.service';
import { QuizApiService } from './quiz-api.service';

@Injectable({
  providedIn: 'root'
})
export class LearningContentService {
  private readonly catalogApi = inject(CatalogApiService);
  private readonly quizApi = inject(QuizApiService);

  getSemestresWithMatieres(): Observable<Array<{ semestre: Semestre; matieres: Matiere[] }>> {
    return this.catalogApi.getSemestres().pipe(
      switchMap((semestres) =>
        forkJoin(
          semestres.map((semestre) =>
            this.catalogApi.getMatieresBySemestre(semestre.id).pipe(
              catchError(() => of([])),
              map((matieres) => ({
                semestre,
                matieres
              }))
            )
          )
        )
      )
    );
  }

  getMatiere(matiereId: number): Observable<Matiere | null> {
    return this.catalogApi.getMatiere(matiereId).pipe(catchError(() => of(null)));
  }

  getChapitresByMatiere(matiereId: number): Observable<Chapitre[]> {
    return this.catalogApi.getChapitresByMatiere(matiereId).pipe(
      catchError(() => of([])),
      switchMap((chapitres) => {
        if (chapitres.length === 0) {
          return of([]);
        }

        return forkJoin(chapitres.map((chapitre) => this.catalogApi.getChapitre(chapitre.id))).pipe(
          map((details) => details.sort((left, right) => left.ordre - right.ordre))
        );
      })
    );
  }

  getCoursByMatiere(matiereId: number): Observable<CoursPdf[]> {
    return this.catalogApi.getCoursByMatiere(matiereId).pipe(catchError(() => of([])));
  }

  getQuizByChapitreId(chapitreId: number): Observable<QuizDetail | null> {
    return this.quizApi.getQuizByChapitreId(chapitreId).pipe(catchError(() => of(null)));
  }
}
