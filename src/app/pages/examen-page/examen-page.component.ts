import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-examen-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './examen-page.component.html',
  styleUrl: './examen-page.component.css'
})
export class ExamenPageComponent implements OnInit {
  Object = Object;
  questions: any[] = [];
  reponses: { [key: number]: string } = {};
  questionActuelle = 0;
  resultat: any = null;
  termine = false;
  isLoading = true;
  errorMessage = '';

  constructor(
    private readonly http: HttpClient,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const quizzId = this.route.snapshot.paramMap.get('quizzId');

    this.http.get<any[]>(`http://localhost:8081/api/questions/quizz/${quizzId}`).subscribe({
      next: (data) => {
        this.questions = [...data];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les questions.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get questionCourante(): any {
    return this.questions[this.questionActuelle];
  }

  get answeredCount(): number {
    return Object.keys(this.reponses).length;
  }

  get progress(): number {
    return this.questions.length > 0 ? ((this.questionActuelle + 1) / this.questions.length) * 100 : 0;
  }

  selectionnerReponse(questionId: number, reponse: string): void {
    this.reponses[questionId] = reponse;
    this.cdr.detectChanges();
  }

  questionSuivante(): void {
    if (this.questionActuelle < this.questions.length - 1) {
      this.questionActuelle++;
      this.cdr.detectChanges();
    }
  }

  questionPrecedente(): void {
    if (this.questionActuelle > 0) {
      this.questionActuelle--;
      this.cdr.detectChanges();
    }
  }

  soumettre(): void {
    if (this.answeredCount < this.questions.length) {
      this.errorMessage = 'Repondez a toutes les questions avant de soumettre.';
      return;
    }

    const quizzId = this.route.snapshot.paramMap.get('quizzId');
    const formationId = this.route.snapshot.paramMap.get('formationId');
    const estExamenFinal = this.route.snapshot.url.some((segment) => segment.path === 'examen-final');
    const url = estExamenFinal
      ? `http://localhost:8081/api/examens/soumettre-final/${quizzId}?etudiantId=1&formationId=${formationId}`
      : `http://localhost:8081/api/examens/soumettre/${quizzId}?etudiantId=1`;

    this.http.post<any>(url, this.reponses).subscribe({
      next: (data) => {
        this.resultat = data;
        this.termine = true;
        this.errorMessage = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'La soumission de l examen a echoue.';
        this.cdr.detectChanges();
      }
    });
  }

  retour(): void {
    const formationId = this.route.snapshot.paramMap.get('formationId');
    this.router.navigate(['/etudiant/formations', formationId]);
  }

  recommencer(): void {
    this.termine = false;
    this.resultat = null;
    this.reponses = {};
    this.questionActuelle = 0;
  }

  getToutesReponses(): string[] {
    const question = this.questionCourante;
    if (!question) {
      return [];
    }

    return [
      question.reponseCorrecte,
      question.reponseFausse1,
      question.reponseFausse2,
      question.reponseFausse3
    ].filter(Boolean);
  }
}
