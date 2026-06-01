import { Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  private auth = inject(AuthService);

  scrolled = false;
  userName = 'Utilisateur';
  userRole = 'Espace étudiant';
  initials = 'U';

  ngOnInit(): void {
    const session = this.auth.session as any;
    if (session) {
      this.userName = session.fullName ?? session.nom ?? 'Utilisateur';
      this.userRole = this.roleLabel(session.role ?? '');
      this.initials = this.userName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p: string) => p[0].toUpperCase())
        .join('');
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 12;
  }

  toggleTheme(): void {
    const html = document.documentElement;
    html.dataset['theme'] = html.dataset['theme'] === 'dark' ? 'light' : 'dark';
  }

  private roleLabel(role: string): string {
    const map: Record<string, string> = {
      'etudiant': 'Espace étudiant',
      'enseignant': 'Espace enseignant',
      'chef-departement': 'Chef de département',
      'admin': 'Administration'
    };
    return map[role] ?? role;
  }
}