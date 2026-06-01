import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-mes-certifications',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './mes-certifications.html',
  styleUrl: './mes-certifications.css'
})
export class MesCertifications implements OnInit {
  certifications: any[] = [];
  private authService = inject(AuthService);

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const etudiantId = this.authService.session?.id ?? 1;
    this.http.get<any[]>(`http://localhost:8080/api/certifications/etudiant/${etudiantId}`).subscribe({
      next: (data) => {
        this.certifications = [...data].sort((a, b) =>
          new Date(b.dateEmission).getTime() - new Date(a.dateEmission).getTime()
        );
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur certifications:', err)
    });
  }

  telechargerPDF(certif: any): void {
    const url = `http://localhost:8080/api/certifications/download/${certif.idCertif}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = 'certification.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}