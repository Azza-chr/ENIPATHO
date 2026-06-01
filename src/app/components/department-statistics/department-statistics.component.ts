import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StatisticsService, GroupeStatistics } from '../../services/statistics.service';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-department-statistics',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
    MatGridListModule
  ],
  template: `
    <div class="statistics-container">
      <mat-card class="header-card">
        <h1>
          <mat-icon>domain</mat-icon>
          Statistiques du Département
        </h1>
        <p>Vue d'ensemble des performances par groupe et niveau</p>
      </mat-card>

      <!-- Filtres par niveau -->
      <mat-card class="filter-card">
        <h3>Filtrer par niveau</h3>
        <div class="level-buttons">
          <button mat-stroked-button 
                  *ngFor="let level of [1, 2, 3]"
                  (click)="filterByLevel(level)"
                  [color]="selectedLevel === level ? 'primary' : ''">
            Niveau {{ level }}
          </button>
          <button mat-stroked-button (click)="resetFilters()">
            Tous les niveaux
          </button>
        </div>
      </mat-card>

      <!-- Vue globale -->
      <mat-card class="overview-card">
        <h3>Vue d'ensemble</h3>
        <div class="overview-grid">
          <div class="overview-item">
            <span class="label">Nombre total de groupes</span>
            <span class="value">{{ filteredStats.length }}</span>
          </div>
          <div class="overview-item">
            <span class="label">Total d'étudiants</span>
            <span class="value">{{ getTotalStudents() }}</span>
          </div>
          <div class="overview-item">
            <span class="label">Score moyen global</span>
            <span class="value">{{ getGlobalAverageScore() | number: '1.1-2' }}</span>
            <mat-progress-bar mode="determinate" [value]="getGlobalAverageScore()"></mat-progress-bar>
          </div>
          <div class="overview-item">
            <span class="label">Badges moyens</span>
            <span class="value">{{ getGlobalAverageBadges() | number: '1.1-2' }}</span>
          </div>
        </div>
      </mat-card>

      <!-- Groupes en cartes -->
      <div class="groups-container">
        <mat-card *ngFor="let groupe of filteredStats; let i = index" class="group-card">
          <div class="card-header">
            <h3>Groupe {{ groupe.groupe }} - Niveau {{ groupe.niveau }}</h3>
            <mat-icon class="card-icon">groups</mat-icon>
          </div>

          <div class="card-stats">
            <div class="stat-row">
              <span class="stat-label">Nombre d'étudiants</span>
              <span class="stat-value">{{ groupe.totalStudents }}/30</span>
              <mat-progress-bar mode="determinate" [value]="(groupe.totalStudents / 30) * 100"></mat-progress-bar>
            </div>

            <div class="stat-row">
              <span class="stat-label">Score moyen</span>
              <span class="stat-value" [ngClass]="getScoreClass(groupe.moyenneScore)">
                {{ groupe.moyenneScore | number: '1.1-2' }}/100
              </span>
              <mat-progress-bar mode="determinate" [value]="groupe.moyenneScore"></mat-progress-bar>
            </div>

            <div class="stat-row">
              <span class="stat-label">Badges moyens</span>
              <span class="stat-value">{{ groupe.moyenneBadges | number: '1.1-2' }}</span>
            </div>

            <div class="stat-row">
              <span class="stat-label">Assiduité moyenne</span>
              <span class="stat-value">{{ groupe.averageAttendance }}%</span>
              <mat-progress-bar mode="determinate" [value]="groupe.averageAttendance"></mat-progress-bar>
            </div>
          </div>

          <div class="card-footer">
            <button mat-button (click)="viewGroupDetails(groupe)">
              <mat-icon>visibility</mat-icon>
              Voir détails
            </button>
          </div>
        </mat-card>
      </div>

      <!-- Message si aucun groupe -->
      <mat-card *ngIf="filteredStats.length === 0 && loaded" class="no-data">
        <mat-icon>info</mat-icon>
        <p>Aucun groupe trouvé pour ce niveau</p>
      </mat-card>

      <!-- Loading -->
      <div *ngIf="!loaded" class="loading">
        <mat-spinner></mat-spinner>
        <p>Chargement des statistiques du département...</p>
      </div>
    </div>
  `,
  styles: [`
    .statistics-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      margin-bottom: 30px;
      border-radius: 8px;
    }

    .header-card h1 {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0 0 10px 0;
      font-size: 28px;
    }

    .header-card p {
      margin: 0;
      opacity: 0.9;
    }

    .filter-card {
      margin-bottom: 30px;
      padding: 20px;
    }

    .filter-card h3 {
      margin: 0 0 15px 0;
    }

    .level-buttons {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .overview-card {
      margin-bottom: 30px;
      padding: 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .overview-card h3 {
      margin-top: 0;
    }

    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .overview-item {
      background: white;
      padding: 20px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
    }

    .value {
      font-size: 28px;
      font-weight: bold;
      color: #333;
    }

    .groups-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .group-card {
      display: flex;
      flex-direction: column;
      border-left: 4px solid #667eea;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .group-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #eee;
      padding-bottom: 15px;
      margin-bottom: 15px;
    }

    .card-header h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }

    .card-icon {
      color: #667eea;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .card-stats {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .stat-row {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .stat-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .stat-value.excellent {
      color: #4caf50;
    }

    .stat-value.good {
      color: #2196f3;
    }

    .stat-value.average {
      color: #ff9800;
    }

    .stat-value.poor {
      color: #f44336;
    }

    .card-footer {
      border-top: 1px solid #eee;
      padding-top: 15px;
      margin-top: 15px;
    }

    .no-data {
      text-align: center;
      padding: 50px;
      color: #999;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 50px;
      color: #999;
    }
  `]
})
export class DepartmentStatisticsComponent implements OnInit {
  allStats: GroupeStatistics[] = [];
  filteredStats: GroupeStatistics[] = [];
  selectedLevel: number | null = null;
  loaded = false;

  constructor(
    private statisticsService: StatisticsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.statisticsService.getDepartmentStatistics().subscribe({
      next: (data) => {
        this.allStats = data;
        this.filteredStats = data;
        this.loaded = true;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques:', err);
        this.snackBar.open('Erreur lors du chargement des statistiques', 'Fermer', { duration: 5000 });
        this.loaded = true;
      }
    });
  }

  filterByLevel(level: number): void {
    this.selectedLevel = level;
    this.filteredStats = this.allStats.filter(stat => stat.niveau === level);
  }

  resetFilters(): void {
    this.selectedLevel = null;
    this.filteredStats = this.allStats;
  }

  getTotalStudents(): number {
    return this.filteredStats.reduce((sum, groupe) => sum + groupe.totalStudents, 0);
  }

  getGlobalAverageScore(): number {
    if (this.filteredStats.length === 0) return 0;
    const total = this.filteredStats.reduce((sum, groupe) => sum + groupe.moyenneScore, 0);
    return total / this.filteredStats.length;
  }

  getGlobalAverageBadges(): number {
    if (this.filteredStats.length === 0) return 0;
    const total = this.filteredStats.reduce((sum, groupe) => sum + groupe.moyenneBadges, 0);
    return total / this.filteredStats.length;
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  }

  viewGroupDetails(groupe: GroupeStatistics): void {
    this.snackBar.open(`Détails du Groupe ${groupe.groupe} - Niveau ${groupe.niveau}`, 'Fermer', { duration: 3000 });
    // À implémenter : ouvrir un dialogue ou naviguer vers une page détails
  }
}
