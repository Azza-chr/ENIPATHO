import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DashboardChartsComponent } from '../../components/dashboard-charts/dashboard-charts.component';
import { StudentDashboardOverview } from '../../models/dashboard.models';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-dashboard-page',
  standalone: true,
  imports: [CommonModule, DashboardChartsComponent, RouterLink],
  templateUrl: './student-dashboard-page.component.html',
  styleUrl: './student-dashboard-page.component.css'
})
export class StudentDashboardPageComponent implements OnInit {
  private readonly dashboardData = inject(DashboardDataService);
  private readonly auth = inject(AuthService);

  get session() {
    return this.auth.session;
  }

  overview: StudentDashboardOverview | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.dashboardData.getStudentOverview().subscribe({
      next: (overview) => {
        this.overview = overview;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}