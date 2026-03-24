import { Route } from '@angular/router';

export const appRoutes: Route[] = [
     {
    path: '',
    loadComponent: () =>
      import('./pages/scoreboard-page/scoreboard-page.component').then(
        (m) => m.ScoreboardPageComponent
      ),
  },
];
