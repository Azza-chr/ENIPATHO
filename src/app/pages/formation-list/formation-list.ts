import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formation-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './formation-list.html',
  styleUrl: './formation-list.css'
})
export class FormationList implements OnInit {
  formations: any[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:8081/api/formations').subscribe({
      next: (data) => {
        this.formations = [...data];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les formations pour le moment.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  voirDetail(id: number): void {
    this.router.navigate(['/etudiant/formations', id]);
  }

  getProgress(index: number): number {
    return [32, 18, 56, 0, 74][index % 5];
  }
}
