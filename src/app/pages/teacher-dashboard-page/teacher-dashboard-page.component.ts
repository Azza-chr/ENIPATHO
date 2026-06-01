// Role: dashboard landing page for teachers with publication and learner insights.
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DashboardChartsComponent } from '../../components/dashboard-charts/dashboard-charts.component';
import { TeacherDashboardOverview } from '../../models/dashboard.models';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-teacher-dashboard-page',
  standalone: true,
  imports: [CommonModule, DashboardChartsComponent],
  templateUrl: './teacher-dashboard-page.component.html',
  styleUrl: './teacher-dashboard-page.component.css'
})
export class TeacherDashboardPageComponent implements OnInit {
  private readonly dashboardData = inject(DashboardDataService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  get session() {
    return this.auth.session;
  }

  overview: TeacherDashboardOverview | null = null;
  isLoading = true;

  get isStatisticsView(): boolean {
    return this.route.snapshot.data['view'] === 'statistics';
  }

  ngOnInit(): void {
    this.dashboardData.getTeacherOverview().subscribe({
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
