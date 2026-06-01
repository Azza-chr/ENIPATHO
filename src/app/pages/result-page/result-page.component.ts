// Role: result page displayed after a quiz submission.
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { QuizSubmitResult } from '../../models/quiz.models';

@Component({
  selector: 'app-result-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './result-page.component.html',
  styleUrl: './result-page.component.css'
})
export class ResultPageComponent {
  readonly result: QuizSubmitResult | null = history.state['result'] ?? null;
  readonly fromChapitreId: number | null = history.state['fromChapitreId'] ?? null;
  readonly fromQuizId: number | null = history.state['fromQuizId'] ?? null;

  constructor() {
    this.persistResult();
  }

  get resultLabel(): string {
    return this.result?.passed ? 'Quiz valide' : 'Quiz non valide';
  }

  private persistResult(): void {
    if (!this.result) {
      return;
    }

    const key = 'enipath.quizResults';
    const raw = localStorage.getItem(key);
    let existing: unknown = [];
    try {
      existing = raw ? JSON.parse(raw) : [];
    } catch {
      existing = [];
    }
    const items = Array.isArray(existing) ? existing : [];
    const next = [
      {
        quizId: this.result.quizId,
        score: this.result.score,
        passed: this.result.passed,
        createdAt: new Date().toISOString()
      },
      ...items.filter((item) => Number(item?.quizId) !== this.result?.quizId)
    ];

    localStorage.setItem(key, JSON.stringify(next.slice(0, 50)));
  }
}
