import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Matiere, Semestre } from '../../models/catalog.models';
import { LearningContentService } from '../../services/learning-content.service';
import { SubjectImagesService } from '../../services/subject-images.service';

@Component({
  selector: 'app-library-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './library-page.component.html',
  styleUrl: './library-page.component.css'
})
export class LibraryPageComponent implements OnInit {
  private readonly learningContent = inject(LearningContentService);
  private readonly subjectImages = inject(SubjectImagesService);

  library: Array<{ semestre: Semestre; matieres: Matiere[] }> = [];
  selectedSemestreId: number | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.learningContent.getSemestresWithMatieres().subscribe({
      next: (library) => {
        this.library = library.filter((item) => this.isFirstYearSemester(item.semestre));
        this.selectedSemestreId = this.library[0]?.semestre.id ?? null;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les cours pour le moment.';
        this.isLoading = false;
      }
    });
  }

  get selectedSemestre(): { semestre: Semestre; matieres: Matiere[] } | undefined {
    return this.library.find((item) => item.semestre.id === this.selectedSemestreId);
  }

  selectSemestre(semestreId: number): void {
    this.selectedSemestreId = semestreId;
  }

  trackSemestre(_: number, item: { semestre: Semestre }): number {
    return item.semestre.id;
  }

  trackMatiere(_: number, item: Matiere): number {
    return item.id;
  }

  getSubjectImageUrl(subjectName: string): string {
    return this.subjectImages.getSubjectImageUrl(subjectName);
  }

  private isFirstYearSemester(semestre: Semestre): boolean {
    const label = `${semestre.code ?? ''} ${semestre.nom ?? ''}`.toLowerCase();
    const matchesLabel = /\b(s|semestre)\s*0?[12]\b/.test(label);

    return semestre.ordre === 1 || semestre.ordre === 2 || matchesLabel;
  }
}
