// Role: student quiz runner with dark mode and answer submission flow.
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { QuizAnswerPayload, QuizDetail, QuizQuestion, QuizSubmitResult } from '../../models/quiz.models';
import { LearningContentService } from '../../services/learning-content.service';
import { QuizApiService } from '../../services/quiz-api.service';

@Component({
  selector: 'app-quiz-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './quiz-page.component.html',
  styleUrl: './quiz-page.component.css'
})
export class QuizPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly learningContent = inject(LearningContentService);
  private readonly quizApi = inject(QuizApiService);

  chapitreId = 0;
  routeQuizId = 0;
  quiz: QuizDetail | null = null;
  currentIndex = 0;
  selectedAnswers: Record<number, number> = {};
  isLoading = true;
  isSubmitting = false;
  errorMessage = '';

  ngOnInit(): void {
    this.chapitreId = Number(this.route.snapshot.paramMap.get('chapitreId'));
    this.routeQuizId = Number(this.route.snapshot.paramMap.get('quizId'));

    if (Number.isFinite(this.routeQuizId) && this.routeQuizId > 0) {
      this.quizApi.getQuizById(this.routeQuizId).subscribe({
        next: (quiz) => {
          this.quiz = quiz;
          this.isLoading = false;
        },
        error: () => {
          this.errorMessage = 'Impossible de charger ce quiz.';
          this.isLoading = false;
        }
      });
      return;
    }

    if (!Number.isFinite(this.chapitreId) || this.chapitreId <= 0) {
      this.errorMessage = 'Identifiant de quiz invalide.';
      this.isLoading = false;
      return;
    }

    this.learningContent.getQuizByChapitreId(this.chapitreId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le quiz de ce cours.';
        this.isLoading = false;
      }
    });
  }

  get currentQuestion(): QuizQuestion | null {
    return this.quiz?.questions[this.currentIndex] ?? null;
  }

  get progressLabel(): string {
    if (!this.quiz) {
      return '';
    }

    return `${this.currentIndex + 1} / ${this.quiz.questions.length}`;
  }

  selectAnswer(questionId: number, answerId: number): void {
    this.selectedAnswers[questionId] = answerId;
  }

  goToNext(): void {
    if (!this.quiz || !this.currentQuestion) {
      return;
    }

    if (!this.selectedAnswers[this.currentQuestion.id]) {
      this.errorMessage = 'Choisis une reponse avant de continuer.';
      return;
    }

    this.errorMessage = '';
    if (this.currentIndex < this.quiz.questions.length - 1) {
      this.currentIndex += 1;
      return;
    }

    this.submitQuiz();
  }

  private submitQuiz(): void {
    if (!this.quiz) {
      return;
    }

    const answers = this.buildAnswersPayload();
    if (answers.length !== this.quiz.questions.length) {
      this.errorMessage = 'Toutes les questions doivent avoir une reponse.';
      return;
    }

    this.isSubmitting = true;
    this.quizApi.submitQuiz(this.quiz.id, answers).subscribe({
      next: (result) => this.navigateToResult(result),
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Le resultat n a pas pu etre calcule.';
      }
    });
  }

  private buildAnswersPayload(): QuizAnswerPayload[] {
    if (!this.quiz) {
      return [];
    }

    return this.quiz.questions.map((question) => ({
      questionId: question.id,
      answerId: this.selectedAnswers[question.id]
    }));
  }

  private navigateToResult(result: QuizSubmitResult): void {
    this.isSubmitting = false;
    this.router.navigate(['/etudiant/resultat'], {
      state: {
        result,
        fromChapitreId: this.chapitreId || null,
        fromQuizId: this.routeQuizId || this.quiz?.id || null
      }
    });
  }
}
