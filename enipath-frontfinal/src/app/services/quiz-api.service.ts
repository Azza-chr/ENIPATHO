import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';

import { environment } from '../../environments/environment';
import { QuizAnswerPayload, QuizDetail, QuizOption, QuizQuestion, QuizSubmitResult } from '../models/quiz.models';

@Injectable({
  providedIn: 'root'
})
export class QuizApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/v1`;

  getQuizByChapitreId(chapitreId: number): Observable<QuizDetail> {
    return this.http.get<unknown>(`${this.apiUrl}/chapitres/${chapitreId}/quiz`).pipe(
      map((payload) => this.extractItem(payload)),
      switchMap((source) => {
        const quiz = this.toQuizDetail(source);
        if (quiz.questions.length > 0) {
          return of(quiz);
        }

        return this.getQuizById(quiz.id);
      })
    );
  }

  getQuizById(quizId: number): Observable<QuizDetail> {
    return this.http.get<unknown>(`${this.apiUrl}/quizzes/${quizId}`).pipe(
      map((payload) => this.toQuizDetail(this.extractItem(payload), quizId))
    );
  }

  submitQuiz(quizId: number, answers: QuizAnswerPayload[]): Observable<QuizSubmitResult> {
    const payload = answers.reduce<Record<string, number>>((accumulator, answer) => {
      accumulator[String(answer.questionId)] = answer.answerId;
      return accumulator;
    }, {});

    return this.http.post<unknown>(`${this.apiUrl}/quizzes/${quizId}/submit`, payload).pipe(
      map((response) => this.toSubmitResult(response, quizId, answers.length))
    );
  }

  private toQuizDetail(source: Record<string, unknown>, fallbackId = 0): QuizDetail {
    return {
      id: this.toNumber(source['id'], fallbackId),
      titre: this.toText(source['titre'], 'Quiz'),
      description: this.toOptionalText(source['description']),
      durationMinutes: this.toOptionalNumber(source['durationMinutes']),
      seuilReussite: this.toNumber(source['passingScore'], 50),
      questions: this.extractArray(source['questions'])
        .map((item, index) => this.toQuestion(item, index))
        .sort((left, right) => (left.ordre ?? 0) - (right.ordre ?? 0))
    };
  }

  private toQuestion(source: Record<string, unknown>, index: number): QuizQuestion {
    return {
      id: this.toNumber(source['id'], index + 1),
      label: this.toText(source['enonce'], `Question ${index + 1}`),
      explication: this.toOptionalText(source['explication']),
      ordre: this.toOptionalNumber(source['ordre']),
      points: this.toOptionalNumber(source['points']),
      options: this.extractArray(source['choices'])
        .map((item, optionIndex) => this.toOption(item, optionIndex))
        .sort((left, right) => (left.ordre ?? 0) - (right.ordre ?? 0))
    };
  }

  private toOption(source: Record<string, unknown>, index: number): QuizOption {
    return {
      id: this.toNumber(source['id'], index + 1),
      label: this.toText(source['label'], `Choix ${index + 1}`),
      ordre: this.toOptionalNumber(source['ordre'])
    };
  }

  private toSubmitResult(payload: unknown, quizId: number, totalQuestions: number): QuizSubmitResult {
    const source = this.extractItem(payload);

    return {
      quizId: this.toNumber(source['quizId'], quizId),
      quizTitre: this.toOptionalText(source['quizTitre']),
      score: this.toNumber(source['scorePercentage'], 0),
      correctAnswers: this.toNumber(source['correctAnswers'], 0),
      totalQuestions: this.toNumber(source['totalQuestions'], totalQuestions),
      passed: Boolean(source['passed'])
    };
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
}