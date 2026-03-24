import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'athletes',
    loadComponent: () =>
      import('@gymnastics-manager/athletes-feature').then(
        (m) => m.AthleteListComponent
      ),
  },
    {
    path: 'scoring',
    loadComponent: () =>
      import('@gymnastics-manager/scoring-feature').then(
        (m) => m.ScoringShellComponent
      ),
  },
  {
    path: '',
    redirectTo: 'athletes',
    pathMatch: 'full',
  },
];

