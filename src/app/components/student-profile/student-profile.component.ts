import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProfileService, EtudiantProfile, EnseignantProfile } from '../../services/profile.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="photo-section">
            <img [src]="profilePhotoUrl" class="profile-photo" alt="Photo de profil">
            <button mat-mini-fab (click)="fileInput.click()" class="upload-btn" title="Changer la photo">
              <mat-icon>camera_alt</mat-icon>
            </button>
            <input hidden (change)="onPhotoSelected($event)" #fileInput type="file" accept="image/*">
          </div>
          <div class="info-section">
            <h1>{{ profile?.prenom }} {{ profile?.nom }}</h1>
            <p class="email">{{ profile?.email }}</p>
            <p class="details" *ngIf="profile?.niveau">
              Niveau: <strong>{{ profile?.niveau }}</strong> | Groupe: <strong>{{ profile?.groupe }}</strong>
            </p>
          </div>
        </div>

        <!-- Tabs -->
        <mat-tab-group>
          <!-- Onglet Informations -->
          <mat-tab label="Informations">
            <div class="tab-content">
              <div class="info-grid">
                <div class="info-item">
                  <label>Nom</label>
                  <p>{{ profile?.nom }}</p>
                </div>
                <div class="info-item">
                  <label>Prénom</label>
                  <p>{{ profile?.prenom }}</p>
                </div>
                <div class="info-item">
                  <label>Email</label>
                  <p>{{ profile?.email }}</p>
                </div>
                <div class="info-item">
                  <label>Niveau</label>
                  <p>{{ profile?.niveau }}</p>
                </div>
                <div class="info-item">
                  <label>Groupe</label>
                  <p>{{ profile?.groupe }}</p>
                </div>
                <div class="info-item">
                  <label>Score</label>
                  <p>{{ profile?.score }} / 100</p>
                </div>
                <div class="info-item">
                  <label>Badges</label>
                  <p>{{ profile?.totalBadges }}</p>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Onglet Sécurité -->
          <mat-tab label="Sécurité">
            <div class="tab-content">
              <h3>Changer le mot de passe</h3>
              <form (ngSubmit)="changePassword()" class="password-form">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Ancien mot de passe</mat-label>
                  <input matInput type="password" [(ngModel)]="oldPassword" name="oldPassword" required>
                  <mat-icon matSuffix>lock</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Nouveau mot de passe</mat-label>
                  <input matInput type="password" [(ngModel)]="newPassword" name="newPassword" required>
                  <mat-icon matSuffix>lock</mat-icon>
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Confirmer le mot de passe</mat-label>
                  <input matInput type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required>
                  <mat-icon matSuffix>lock</mat-icon>
                </mat-form-field>

                <button mat-raised-button color="primary" type="submit" class="full-width">
                  <mat-icon>save</mat-icon> Mettre à jour le mot de passe
                </button>
              </form>
            </div>
          </mat-tab>

          <!-- Onglet Statistiques -->
          <mat-tab label="Statistiques" *ngIf="profile?.score">
            <div class="tab-content">
              <div class="stats-grid">
                <div class="stat-card">
                  <h4>Score</h4>
                  <div class="stat-value">{{ profile?.score }}<span class="unit">/100</span></div>
                  <mat-progress-bar mode="determinate" [value]="profile?.score || 0"></mat-progress-bar>
                </div>
                <div class="stat-card">
                  <h4>Badges</h4>
                  <div class="stat-value">{{ profile?.totalBadges }}</div>
                  <p class="stat-description">Badges obtenus</p>
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
    }

    .profile-card {
      background: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .profile-header {
      display: flex;
      gap: 30px;
      padding: 30px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 4px 4px 0 0;
      align-items: center;
    }

    .photo-section {
      position: relative;
      flex-shrink: 0;
    }

    .profile-photo {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid white;
      cursor: pointer;
    }

    .upload-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      background: #ff6b6b;
    }

    .info-section h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }

    .email {
      opacity: 0.9;
      margin: 5px 0;
    }

    .details {
      opacity: 0.85;
      font-size: 14px;
    }

    .tab-content {
      padding: 30px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .info-item {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
    }

    .info-item label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
      display: block;
      margin-bottom: 5px;
    }

    .info-item p {
      font-size: 16px;
      margin: 0;
      color: #333;
    }

    .password-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 500px;
    }

    .full-width {
      width: 100%;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .stat-card {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }

    .stat-card h4 {
      margin: 0 0 15px 0;
      color: #667eea;
    }

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #333;
    }

    .unit {
      font-size: 16px;
      color: #999;
    }

    .stat-description {
      margin: 10px 0 0 0;
      color: #666;
      font-size: 14px;
    }
  `]
})
export class StudentProfileComponent implements OnInit {
  profile: EtudiantProfile | null = null;
  profilePhotoUrl = 'assets/default-avatar.png';
  
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  
  userId: number = 0;

  constructor(
    private profileService: ProfileService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.userId = Number(localStorage.getItem('user_id'));
    if (this.userId) {
      this.loadProfile();
      this.loadProfilePhoto();
    }
  }

  loadProfile(): void {
    this.profileService.getStudentProfile(this.userId).subscribe({
      next: (profile) => {
        this.profile = profile;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du profil:', err);
        this.snackBar.open('Erreur lors du chargement du profil', 'Fermer', { duration: 5000 });
      }
    });
  }

  loadProfilePhoto(): void {
    this.profileService.getProfilePhoto(this.userId).subscribe({
      next: (blob) => {
        if (blob.size > 0) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.profilePhotoUrl = e.target?.result as string;
          };
          reader.readAsDataURL(blob);
        }
      },
      error: (err) => console.error('Erreur lors du chargement de la photo:', err)
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      
      this.profileService.uploadProfilePhoto(this.userId, file).subscribe({
        next: () => {
          this.loadProfilePhoto();
          this.snackBar.open('Photo mise à jour avec succès', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          console.error('Erreur lors du téléchargement de la photo:', err);
          this.snackBar.open('Erreur lors du téléchargement de la photo', 'Fermer', { duration: 5000 });
        }
      });
    }
  }

  changePassword(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.snackBar.open('Les mots de passe ne correspondent pas', 'Fermer', { duration: 3000 });
      return;
    }

    if (this.newPassword.length < 6) {
      this.snackBar.open('Le nouveau mot de passe doit contenir au moins 6 caractères', 'Fermer', { duration: 3000 });
      return;
    }

    this.profileService.changePassword(this.userId, this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.snackBar.open('Mot de passe modifié avec succès', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        console.error('Erreur lors du changement de mot de passe:', err);
        this.snackBar.open(err.error?.error || 'Erreur lors du changement de mot de passe', 'Fermer', { duration: 5000 });
      }
    });
  }
}
