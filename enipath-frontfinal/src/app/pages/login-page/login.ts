import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  isDark = true;

  constructor(private authService: AuthService, private router: Router) {
    const saved = localStorage.getItem('enipath-theme');
    this.isDark = saved ? saved === 'dark' : true;
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    localStorage.setItem('enipath-theme', this.isDark ? 'dark' : 'light');
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email et mot de passe sont obligatoires.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        const session = this.authService.session;
        this.router.navigate([session?.redirectTo ?? '/etudiant']);
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Identifiants invalides.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}