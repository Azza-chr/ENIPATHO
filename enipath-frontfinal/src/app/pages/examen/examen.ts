import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-examen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './examen.html',
  styleUrl: './examen.css'
})
export class Examen implements OnInit {
  Object = Object;
  questions: any[] = [];
  quizz: any = null;
  reponses: { [key: number]: string } = {};
  questionActuelle: number = 0;
  resultat: any = null;
  termine: boolean = false;
  estExamenFinal: boolean = false;
  isLoading: boolean = true;
  errorMessage: string = '';

  private authService = inject(AuthService);

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  get questionCourante(): any {
    return this.questions[this.questionActuelle] ?? null;
  }

  get answeredCount(): number {
    return Object.keys(this.reponses).length;
  }

  get progress(): number {
    if (this.questions.length === 0) return 0;
    return (this.answeredCount / this.questions.length) * 100;
  }

  ngOnInit(): void {
    const quizzId = this.route.snapshot.paramMap.get('quizzId');
    this.estExamenFinal = this.route.snapshot.url.some(segment => segment.path === 'examen-final');

    this.http.get<any[]>(`http://localhost:8080/api/examens/questions/${quizzId}`).subscribe({
      next: (data) => {
        this.questions = [...data];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement questions:', err);
        this.errorMessage = 'Impossible de charger les questions.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
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
    const quizzId = this.route.snapshot.paramMap.get('quizzId');
    const formationId = this.route.snapshot.paramMap.get('formationId');
    const etudiantId = this.authService.session?.id ?? 1;

    const reponsesFormatees: { [key: string]: string } = {};
    Object.keys(this.reponses).forEach(key => {
      reponsesFormatees[key] = this.reponses[Number(key)];
    });

    let url: string;
    if (this.estExamenFinal) {
      url = `http://localhost:8080/api/examens/soumettre-final/${quizzId}?etudiantId=${etudiantId}&formationId=${formationId}`;
    } else {
      url = `http://localhost:8080/api/examens/soumettre/${quizzId}?etudiantId=${etudiantId}`;
    }

    this.http.post<any>(url, reponsesFormatees).subscribe({
      next: (data) => {
        this.resultat = data;
        this.termine = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur soumission:', err);
        this.errorMessage = 'Erreur lors de la soumission.';
        this.cdr.detectChanges();
      }
    });
  }

  recommencer(): void {
  this.reponses = {};
  this.questionActuelle = 0;
  this.resultat = null;
  this.termine = false;
  this.errorMessage = '';
  this.ngOnInit();
}

  retour(): void {
    const formationId = this.route.snapshot.paramMap.get('formationId');
    this.router.navigate(['/etudiant/formations', formationId]);
  }

  getToutesReponses(): string[] {
    const q = this.questions[this.questionActuelle];
    if (!q) return [];
    return [q.reponseCorrecte, q.reponseFausse1, q.reponseFausse2, q.reponseFausse3]
      .filter(r => r)
      .sort(() => Math.random() - 0.5);
  }
}