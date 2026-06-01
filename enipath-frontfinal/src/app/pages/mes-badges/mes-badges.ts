import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-mes-badges',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './mes-badges.html',
  styleUrl: './mes-badges.css'
})
export class MesBadges implements OnInit {
  badges: any[] = [];
  private authService = inject(AuthService);

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const etudiantId = this.authService.session?.id ?? 1;
    this.http.get<any[]>(`http://localhost:8080/api/badges-formation/etudiant/${etudiantId}`).subscribe({
      next: (data) => {
        this.badges = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur badges:', err)
    });
  }

  getTypeBadgeColor(type: string): string {
    switch(type) {
      case 'Expert': return 'var(--warning)';
      case 'FormationCertifiee': return 'var(--accent-orange)';
      case 'ModuleValide': return 'var(--accent-blue)';
      case 'PremierCours': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  }
  getBadgeBg(type: string): string {
  switch (type) {
    case 'Expert':            return 'rgba(245, 185, 66, 0.12)';
    case 'FormationCertifiee': return 'rgba(212, 113, 30, 0.1)';
    case 'ModuleValide':      return 'rgba(26, 58, 92, 0.08)';
    case 'PremierCours':      return 'rgba(45, 138, 78, 0.1)';
    default:                  return 'var(--surface-soft)';
  }
}

getBadgeBorder(type: string): string {
  switch (type) {
    case 'Expert':            return 'rgba(245, 185, 66, 0.3)';
    case 'FormationCertifiee': return 'rgba(212, 113, 30, 0.25)';
    case 'ModuleValide':      return 'rgba(26, 58, 92, 0.18)';
    case 'PremierCours':      return 'rgba(45, 138, 78, 0.25)';
    default:                  return 'var(--border-color)';
  }
}
}