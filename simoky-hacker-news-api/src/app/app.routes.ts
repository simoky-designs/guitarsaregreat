import { Routes } from '@angular/router';
import { NewsDashboard } from './features/news-dashboard/news-dashboard';
import { Login } from './features/login/login';

export const routes: Routes = [
  {
    path: '',
    component: NewsDashboard,
  },
  {
    path: 'news-dashboard',
    component: NewsDashboard,
  },
  {
    path: 'login',
    component: Login,
  },
];
