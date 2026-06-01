import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { DashboardChart, DashboardChartDatum } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-charts.component.html',
  styleUrl: './dashboard-charts.component.css'
})
export class DashboardChartsComponent {
  @Input({ required: true }) charts: DashboardChart[] = [];

  maxValue(chart: DashboardChart): number {
    return Math.max(...chart.items.map((item) => item.value), 1);
  }

  barHeight(item: DashboardChartDatum, chart: DashboardChart): number {
    return Math.max(8, Math.round((item.value / this.maxValue(chart)) * 100));
  }

  total(chart: DashboardChart): number {
    return chart.items.reduce((sum, item) => sum + item.value, 0);
  }

  percent(item: DashboardChartDatum, chart: DashboardChart): number {
    const total = this.total(chart);
    return total > 0 ? Math.round((item.value / total) * 100) : 0;
  }

  topItem(chart: DashboardChart): DashboardChartDatum {
    return chart.items.reduce(
      (best, item) => (item.value > best.value ? item : best),
      chart.items[0] ?? { label: 'Aucune donnee', value: 0 }
    );
  }

  pieBackground(chart: DashboardChart): string {
    const total = this.total(chart);
    if (total <= 0) {
      return '#64748b';
    }

    let cursor = 0;
    const parts = chart.items.map((item, index) => {
      const start = cursor;
      cursor += (item.value / total) * 100;
      return `${item.color ?? this.fallbackColor(index)} ${start}% ${cursor}%`;
    });

    return `conic-gradient(${parts.join(', ')})`;
  }

  private fallbackColor(index: number): string {
    const colors = ['#38bdf8', '#f97316', '#34d399', '#a78bfa', '#facc15', '#fb7185', '#22c55e'];
    return colors[index % colors.length];
  }
}
