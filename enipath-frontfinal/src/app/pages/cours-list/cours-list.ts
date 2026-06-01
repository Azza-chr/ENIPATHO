import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cours-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cours-list.html',
  styleUrl: './cours-list.css'
})
export class CoursList implements OnInit {

  cours: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:8080/api/cours').subscribe({
      next: (data) => {
        this.cours = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }
}