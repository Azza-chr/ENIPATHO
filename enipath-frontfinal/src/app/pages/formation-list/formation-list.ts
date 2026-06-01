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

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:8080/api/formations').subscribe({
      next: (data) => {
        this.formations = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur:', err)
    });
  }

  voirDetail(id: number): void {
    this.router.navigate(['/etudiant/formations', id]);
  }
}