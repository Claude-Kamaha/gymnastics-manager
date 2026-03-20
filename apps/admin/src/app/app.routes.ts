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
    path: '',
    redirectTo: 'athletes',
    pathMatch: 'full',
  },
];

