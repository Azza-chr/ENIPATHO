import { Routes } from '@angular/router';

export const AI_LANDING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./ai-landing.component').then(m => m.AiLandingComponent)
  }
];
