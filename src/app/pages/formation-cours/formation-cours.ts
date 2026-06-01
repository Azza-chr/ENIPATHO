import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

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
  coursActif: any = null;
  indexActif: number = 0;
  isLoading = true;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const moduleId = this.route.snapshot.paramMap.get('moduleId');
    this.http.get<any>(`http://localhost:8081/api/modules/${moduleId}`).subscribe({
      next: (data) => {
        this.module = data;
        this.cdr.detectChanges();
      }
    });

    this.http.get<any[]>(`http://localhost:8081/api/cours-formation/module/${moduleId}`).subscribe({
      next: (data) => {
        this.cours = [...data];
        if (this.cours.length > 0) {
          this.coursActif = this.cours[0];
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectCours(cours: any, index: number): void {
    this.coursActif = cours;
    this.indexActif = index;
    this.cdr.detectChanges();
  }

  suivant(): void {
    if (this.indexActif < this.cours.length - 1) {
      this.indexActif++;
      this.coursActif = this.cours[this.indexActif];
      this.cdr.detectChanges();
    }
  }

  precedent(): void {
    if (this.indexActif > 0) {
      this.indexActif--;
      this.coursActif = this.cours[this.indexActif];
      this.cdr.detectChanges();
    }
  }

  retour(): void {
    const formationId = this.route.snapshot.paramMap.get('formationId');
    this.router.navigate(['/etudiant/formations', formationId]);
  }

  get progress(): number {
    return this.cours.length > 0 ? ((this.indexActif + 1) / this.cours.length) * 100 : 0;
  }
}
