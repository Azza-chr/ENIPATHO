import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
export class FormationDetail implements OnInit {
  formation: any = null;
  modules: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.http.get<any>(`http://localhost:8081/api/formations/${id}`).subscribe({
      next: (data) => {
        this.formation = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger cette formation.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });

    this.http.get<any[]>(`http://localhost:8081/api/modules/formation/${id}`).subscribe({
      next: (data) => {
        this.modules = [...data];
        this.cdr.detectChanges();
      }
    });
  }

  allerAuCours(moduleId: number): void {
    const formationId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/etudiant/formations', formationId, 'module', moduleId, 'cours']);
  }

  passerExamen(quizzId: number): void {
    const formationId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/etudiant/formations', formationId, 'examen', quizzId]);
  }

  passerExamenFinal(quizzId: number): void {
    const formationId = this.route.snapshot.paramMap.get('id');
    this.router.navigate(['/etudiant/formations', formationId, 'examen-final', quizzId]);
  }

  retour(): void {
    this.router.navigate(['/etudiant/formations']);
  }
}
