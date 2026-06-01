import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { LogoutService } from '../../services/logout.service';
import { LogoutConfirmDialogComponent } from '../logout-confirm-dialog/logout-confirm-dialog.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule
  ],
  template: `
    <mat-toolbar color="primary" class="navbar">
      <div class="navbar-content">
        <div class="navbar-left">
          <button mat-icon-button routerLink="/dashboard" class="logo-btn">
            <span class="app-title">ENIPATH</span>
          </button>
        </div>

        <div class="navbar-center">
          <nav class="nav-links">
            <button mat-button routerLink="/profile" routerLinkActive="active">
              Profil
            </button>
            <button mat-button routerLink="/statistics" routerLinkActive="active">
              Statistiques
            </button>
            <button mat-button routerLink="/courses" routerLinkActive="active">
              Cours
            </button>
          </nav>
        </div>

        <div class="navbar-right">
          <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-menu-btn">
            👤
          </button>
          <mat-menu #userMenu="matMenu" class="user-menu">
            <div mat-menu-item class="user-info">
              <div>
                <p class="user-name">{{ userName }}</p>
                <p class="user-email">{{ userEmail }}</p>
              </div>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item routerLink="/profile">
              <span>Mon Profil</span>
            </button>
            <button mat-menu-item routerLink="/settings">
              <span>Paramètres</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()" class="logout-btn">
              <span>Déconnexion</span>
            </button>
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      padding: 0 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 999;
    }

    .navbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      max-width: 1600px;
      margin: 0 auto;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .logo-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      text-decoration: none;
    }

    .app-title {
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 2px;
    }

    .navbar-center {
      flex: 1;
      display: flex;
      justify-content: center;
    }

    .nav-links {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .nav-links button {
      color: white;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-links button.active {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .user-menu-btn {
      color: white;
    }

    .user-menu {
      min-width: 250px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      cursor: default;
    }

    .user-name {
      margin: 0;
      font-weight: 600;
      color: #333;
    }

    .user-email {
      margin: 0;
      font-size: 12px;
      color: #999;
    }

    .logout-btn {
      color: #f44336 !important;
    }

    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }

      .app-title {
        display: none;
      }

      .navbar-content {
        justify-content: space-between;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  userName: string = 'Utilisateur';
  userEmail: string = '';

  constructor(
    private logoutService: LogoutService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    const firstName = localStorage.getItem('user_prenom') || 'Utilisateur';
    const lastName = localStorage.getItem('user_nom') || '';
    const email = localStorage.getItem('user_email') || '';

    this.userName = `${firstName} ${lastName}`.trim();
    this.userEmail = email;
  }

  logout(): void {
    this.logoutService.logout();
  }
}
