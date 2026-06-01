// Role: generic placeholder page used for upcoming modules like formations, AI, messages and announcements.
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-feature-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-page.component.html',
  styleUrl: './feature-page.component.css'
})
export class FeaturePageComponent {
  private readonly route = inject(ActivatedRoute);

  get feature() {
    return this.route.snapshot.data['feature'] as {
      eyebrow: string;
      title: string;
      description: string;
      stats: Array<{ label: string; value: string; detail: string }>;
      cards: Array<{ title: string; text: string; meta: string }>;
    };
  }
}
