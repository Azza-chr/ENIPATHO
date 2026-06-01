import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';

@Component({
  selector: 'app-formation-cours',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './formation-cours.html',
  styleUrl: './formation-cours.css'
})
export class FormationCours implements OnInit {

  cours: any[] = [];
  module: any = null;
  modules: any[] = [];
  formation: any = null;
  coursActif: any = null;
  indexActif: number = 0;
  contenuHtml: SafeHtml = '';
  moduleActuelId: number = 0;
  modulesValides: number[] = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const moduleId = params['moduleId'];
      const formationId = params['formationId'];
      this.moduleActuelId = Number(moduleId);
      this.chargerDonnees(moduleId, formationId);
    });
  }

  chargerDonnees(moduleId: string, formationId: string): void {
    this.cours = [];
    this.coursActif = null;
    this.indexActif = 0;
    this.contenuHtml = '';

    this.http.get<any>(`http://localhost:8080/api/modules/${moduleId}`).subscribe({
      next: (data) => { this.module = data; this.cdr.detectChanges(); }
    });

    if (this.modules.length === 0) {
      this.http.get<any[]>(`http://localhost:8080/api/modules/formation/${formationId}`).subscribe({
        next: (data) => { this.modules = data; this.cdr.detectChanges(); }
      });
    }

    if (!this.formation) {
      this.http.get<any>(`http://localhost:8080/api/formations/${formationId}`).subscribe({
        next: (data) => { this.formation = data; this.cdr.detectChanges(); }
      });
    }

    this.http.get<number[]>(`http://localhost:8080/api/examens/modules-valides/1`).subscribe({
      next: (data) => { this.modulesValides = data; this.cdr.detectChanges(); },
      error: () => { this.modulesValides = []; }
    });

    this.http.get<any[]>(`http://localhost:8080/api/cours-formation/module/${moduleId}`).subscribe({
      next: (data) => {
        this.cours = [...data];
        this.indexActif = 0;
        if (this.cours.length > 0) {
          this.coursActif = this.cours[0];
          this.renderMarkdown(this.cours[0].contenu);
        }
        this.cdr.detectChanges();
      }
    });
  }

  estModuleValide(moduleId: number): boolean {
    return this.modulesValides.includes(moduleId);
  }

  renderMarkdown(contenu: string): void {
    if (!contenu) { this.contenuHtml = ''; return; }
    const html = marked.parse(contenu) as string;
    this.contenuHtml = this.sanitizer.bypassSecurityTrustHtml(html);
  }

  selectCours(cours: any, index: number): void {
    this.coursActif = cours;
    this.indexActif = index;
    this.renderMarkdown(cours.contenu);
    this.cdr.detectChanges();
  }

  allerAuModule(moduleId: number): void {
    const formationId = this.route.snapshot.paramMap.get('formationId');
    this.modules = [];
    this.formation = null;
    this.router.navigate(['/etudiant/formations', formationId, 'module', moduleId, 'cours']);
  }

  passerExamen(quizzId: number): void {
    const formationId = this.route.snapshot.paramMap.get('formationId');
    this.router.navigate(['/etudiant/formations', formationId, 'examen', quizzId]);
  }

  suivant(): void {
    if (this.indexActif < this.cours.length - 1) {
      this.indexActif++;
      this.coursActif = this.cours[this.indexActif];
      this.renderMarkdown(this.coursActif.contenu);
      this.cdr.detectChanges();
    }
  }

  precedent(): void {
    if (this.indexActif > 0) {
      this.indexActif--;
      this.coursActif = this.cours[this.indexActif];
      this.renderMarkdown(this.coursActif.contenu);
      this.cdr.detectChanges();
    }
  }

  retour(): void {
    const formationId = this.route.snapshot.paramMap.get('formationId');
    this.router.navigate(['/etudiant/formations', formationId]);
  }

  getModuleActuelId(): number {
    return this.moduleActuelId;
  }
}