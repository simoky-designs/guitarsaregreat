import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'top',
    pathMatch: 'full',
  },
  {
    path: 'top',
    loadComponent: () =>
      import('./features/news-dashboard/news-dashboard').then(({ NewsDashboard }) => NewsDashboard),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then(({ Login }) => Login),
  },
];
