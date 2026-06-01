import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Chapitre, CoursPdf, Matiere } from '../../models/catalog.models';
import { LearningContentService } from '../../services/learning-content.service';

@Component({
  selector: 'app-subject-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './subject-detail-page.component.html',
  styleUrl: './subject-detail-page.component.css'
})
export class SubjectDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly learningContent = inject(LearningContentService);

  matiere: Matiere | null = null;
  cours: CoursPdf[] = [];
  chapitres: Chapitre[] = [];
  isLoading = true;
  errorMessage = '';

  get quizCount(): number {
    return this.cours.filter((cours) => cours.quizId).length + this.chapitres.filter((chapitre) => chapitre.quizId).length;
  }

  get resourceCount(): number {
    return this.cours.length + this.chapitres.reduce((sum, chapitre) => sum + chapitre.ressources.length, 0);
  }

  ngOnInit(): void {
    const matiereId = Number(this.route.snapshot.paramMap.get('matiereId'));
    if (!Number.isFinite(matiereId) || matiereId <= 0) {
      this.errorMessage = 'Identifiant de matiere invalide.';
      this.isLoading = false;
      return;
    }

    this.loadData(matiereId);
  }

  refresh(): void {
    const matiereId = Number(this.route.snapshot.paramMap.get('matiereId'));
    if (Number.isFinite(matiereId) && matiereId > 0) {
      this.loadData(matiereId, false);
    }
  }

  trackCours(_: number, cours: CoursPdf): number {
    return cours.id;
  }

  trackChapitre(_: number, chapitre: Chapitre): number {
    return chapitre.id;
  }

  private loadData(matiereId: number, initialLoad = true): void {
    if (initialLoad) {
      this.isLoading = true;
    }

    forkJoin({
      matiere: this.learningContent.getMatiere(matiereId),
      cours: this.learningContent.getCoursByMatiere(matiereId),
      chapitres: this.learningContent.getChapitresByMatiere(matiereId)
    }).subscribe({
      next: ({ matiere, cours, chapitres }) => {
        this.matiere = matiere;
        this.cours = cours;
        this.chapitres = chapitres;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger le detail de cette matiere.';
        this.isLoading = false;
      }
    });
  }
}
