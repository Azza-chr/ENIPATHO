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
import { StatisticsService, StudentStatistics, GroupeStatistics } from '../../services/statistics.service';

@Component({
  selector: 'app-teacher-statistics',
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
    MatSnackBarModule
  ],
  template: `
    <div class="statistics-container">
      <mat-card class="header-card">
        <h1>
          <mat-icon>assessment</mat-icon>
          Suivi des Étudiants
        </h1>
        <p>Visualisez les statistiques détaillées de vos étudiants</p>
      </mat-card>

      <mat-tab-group *ngIf="teacherGroupsStats.length > 0">
        <!-- Onglet par groupe -->
        <mat-tab *ngFor="let groupe of teacherGroupsStats; let i = index" 
                  [label]="'Groupe ' + groupe.groupe + ' (Niveau ' + groupe.niveau + ')'">
          <div class="tab-content">
            <div class="group-summary">
              <h3>Résumé du Groupe</h3>
              <div class="summary-grid">
                <div class="summary-card">
                  <span class="label">Nombre d'étudiants</span>
                  <span class="value">{{ groupe.totalStudents }}</span>
                </div>
                <div class="summary-card">
                  <span class="label">Moyenne des scores</span>
                  <span class="value">{{ groupe.moyenneScore | number: '1.1-2' }}</span>
                  <mat-progress-bar mode="determinate" [value]="groupe.moyenneScore"></mat-progress-bar>
                </div>
                <div class="summary-card">
                  <span class="label">Moyenne des badges</span>
                  <span class="value">{{ groupe.moyenneBadges | number: '1.1-2' }}</span>
                </div>
                <div class="summary-card">
                  <span class="label">Assiduité moyenne</span>
                  <span class="value">{{ groupe.averageAttendance }}%</span>
                  <mat-progress-bar mode="determinate" [value]="groupe.averageAttendance"></mat-progress-bar>
                </div>
              </div>
            </div>

            <!-- Tableau des étudiants -->
            <div class="students-table-container">
              <h3>Détails des étudiants</h3>
              <table mat-table [dataSource]="groupe.students || []" class="students-table">
                <!-- Colonne Nom -->
                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Nom</th>
                  <td mat-cell *matCellDef="let student">{{ student.studentName }}</td>
                </ng-container>

                <!-- Colonne Email -->
                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let student">{{ student.studentEmail }}</td>
                </ng-container>

                <!-- Colonne Score -->
                <ng-container matColumnDef="score">
                  <th mat-header-cell *matHeaderCellDef>Score</th>
                  <td mat-cell *matCellDef="let student">
                    <span class="score-badge" [ngClass]="getScoreClass(student.score)">
                      {{ student.score }}/100
                    </span>
                  </td>
                </ng-container>

                <!-- Colonne Badges -->
                <ng-container matColumnDef="badges">
                  <th mat-header-cell *matHeaderCellDef>Badges</th>
                  <td mat-cell *matCellDef="let student">
                    <mat-chip [style.background]="'#ffc107'">{{ student.totalBadges }}</mat-chip>
                  </td>
                </ng-container>

                <!-- Colonne Assiduité -->
                <ng-container matColumnDef="attendance">
                  <th mat-header-cell *matHeaderCellDef>Assiduité</th>
                  <td mat-cell *matCellDef="let student">
                    {{ student.attendance }}%
                  </td>
                </ng-container>

                <!-- Colonne Statut -->
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Statut</th>
                  <td mat-cell *matCellDef="let student">
                    <mat-chip [ngClass]="'status-' + student.status.toLowerCase()">
                      {{ student.status }}
                    </mat-chip>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true" class="header-row"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Message si pas de groupes -->
      <mat-card *ngIf="teacherGroupsStats.length === 0 && loaded" class="no-data">
        <mat-icon>info</mat-icon>
        <p>Aucun groupe assigné. Contactez l'administrateur.</p>
      </mat-card>

      <!-- Loading -->
      <div *ngIf="!loaded" class="loading">
        <mat-spinner></mat-spinner>
        <p>Chargement des statistiques...</p>
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

    .tab-content {
      padding: 30px;
    }

    .group-summary {
      margin-bottom: 40px;
    }

    .group-summary h3 {
      margin-bottom: 20px;
      color: #333;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .summary-card {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      border-left: 4px solid #667eea;
    }

    .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
    }

    .value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }

    .students-table-container {
      margin-top: 30px;
    }

    .students-table-container h3 {
      margin-bottom: 20px;
      color: #333;
    }

    .students-table {
      width: 100%;
      border-collapse: collapse;
    }

    .students-table th {
      background: #667eea;
      color: white;
      font-weight: 600;
      text-align: left;
      padding: 15px;
    }

    .students-table td {
      padding: 12px 15px;
      border-bottom: 1px solid #eee;
    }

    .students-table tr:hover {
      background: #f9f9f9;
    }

    .score-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
    }

    .score-badge.excellent {
      background: #4caf50;
      color: white;
    }

    .score-badge.good {
      background: #2196f3;
      color: white;
    }

    .score-badge.average {
      background: #ff9800;
      color: white;
    }

    .score-badge.poor {
      background: #f44336;
      color: white;
    }

    .status-actif {
      background: #4caf50;
      color: white;
    }

    .status-absent {
      background: #f44336;
      color: white;
    }

    .status-retard {
      background: #ff9800;
      color: white;
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

    .header-row {
      position: sticky;
      top: 0;
      z-index: 100;
    }
  `]
})
export class TeacherStatisticsComponent implements OnInit {
  teacherGroupsStats: GroupeStatistics[] = [];
  displayedColumns: string[] = ['name', 'email', 'score', 'badges', 'attendance', 'status'];
  loaded = false;
  teacherId: number = 0;

  constructor(
    private statisticsService: StatisticsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.teacherId = Number(localStorage.getItem('user_id'));
    if (this.teacherId) {
      this.loadStatistics();
    } else {
      this.snackBar.open('Erreur: ID enseignant non trouvé', 'Fermer', { duration: 5000 });
    }
  }

  loadStatistics(): void {
    this.statisticsService.getTeacherGroupsStatistics(this.teacherId).subscribe({
      next: (data) => {
        this.teacherGroupsStats = data;
        this.loaded = true;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des statistiques:', err);
        this.snackBar.open('Erreur lors du chargement des statistiques', 'Fermer', { duration: 5000 });
        this.loaded = true;
      }
    });
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'poor';
  }
}
