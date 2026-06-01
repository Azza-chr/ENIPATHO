import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-formation-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './formation-detail.html',
  styleUrl: './formation-detail.css'
})
export class FormationDetail implements OnInit, OnDestroy {

  formation: any = null;
  modules: any[] = [];
  modulesValides: number[] = [];
  modalOuvert: boolean = false;
  zoomLevel: number = 1;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.http.get<any>(`http://localhost:8080/api/formations/${id}`).subscribe({
      next: (data) => { this.formation = data; this.cdr.detectChanges(); }
    });

    this.http.get<any[]>(`http://localhost:8080/api/modules/formation/${id}`).subscribe({
      next: (data) => { this.modules = [...data]; this.cdr.detectChanges(); }
    });

    this.http.get<number[]>(`http://localhost:8080/api/examens/modules-valides/1`).subscribe({
      next: (data) => { this.modulesValides = data; this.cdr.detectChanges(); },
      error: () => { this.modulesValides = []; }
    });
  }

  ngOnDestroy(): void {
    // Nettoyer si on quitte la page avec le modal ouvert
    document.body.removeAttribute('style');
    document.documentElement.removeAttribute('style');
  }

  estModuleValide(moduleId: number): boolean {
    return this.modulesValides.includes(moduleId);
  }

  ouvrirModal(): void {
    this.modalOuvert = true;
    this.zoomLevel = 1;
    document.body.style.cssText = 'overflow: hidden !important; position: fixed; width: 100%;';
    this.cdr.detectChanges();
  }

  fermerModal(): void {
    this.modalOuvert = false;
    this.zoomLevel = 1;
    document.body.style.cssText = '';
    this.cdr.detectChanges();
  }

  zoomIn(): void {
    if (this.zoomLevel < 3) {
      this.zoomLevel = Math.round((this.zoomLevel + 0.25) * 100) / 100;
      this.cdr.detectChanges();
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 0.5) {
      this.zoomLevel = Math.round((this.zoomLevel - 0.25) * 100) / 100;
      this.cdr.detectChanges();
    }
  }

  resetZoom(): void {
    this.zoomLevel = 1;
    this.cdr.detectChanges();
  }

  allerAuCours(moduleId: number): void {
    const formationId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/etudiant/formations', formationId, 'module', moduleId, 'cours']);
  }

  passerExamen(quizzId: number): void {
    const formationId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/etudiant/formations', formationId, 'examen', quizzId]);
  }

  passerExamenFinal(): void {
    const formationId = this.route.snapshot.paramMap.get('id');
    const quizzId = this.formation?.examenFinal?.idQuizz;
    if (!quizzId) {
      alert('Aucun examen final disponible !');
      return;
    }
    this.router.navigate(['/etudiant/formations', formationId, 'examen-final', quizzId]);
  }

  retour(): void {
    this.router.navigate(['/etudiant/formations']);
  }
}