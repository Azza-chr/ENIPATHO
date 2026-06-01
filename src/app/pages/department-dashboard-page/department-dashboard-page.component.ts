// Role: dashboard landing page for the department head space.
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DashboardChartsComponent } from '../../components/dashboard-charts/dashboard-charts.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { DepartmentDashboardOverview } from '../../models/dashboard.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-department-dashboard-page',
  standalone: true,
  imports: [CommonModule, DashboardChartsComponent],
  templateUrl: './department-dashboard-page.component.html',
  styleUrl: './department-dashboard-page.component.css'
})
export class DepartmentDashboardPageComponent implements OnInit {
  private readonly dashboardData = inject(DashboardDataService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  get session() {
    return this.auth.session;
  }

  overview: DepartmentDashboardOverview | null = null;
  isLoading = true;

  get isStatisticsView(): boolean {
    return this.route.snapshot.data['view'] === 'statistics';
  }

  ngOnInit(): void {
    this.dashboardData.getDepartmentOverview().subscribe({
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
