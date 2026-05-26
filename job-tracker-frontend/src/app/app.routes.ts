import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  // ── Routes publiques ──
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component')
          .then(m => m.RegisterComponent)
      }
    ]
  },

  // ── Routes protégées — toutes dans le layout ──
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/main-layout.component')
      .then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'applications',
        loadComponent: () => import('./features/applications/list/application-list.component')
          .then(m => m.ApplicationListComponent)
      },
      {
        path: 'applications/new',
        loadComponent: () => import('./features/applications/create/application-create.component')
          .then(m => m.ApplicationCreateComponent)
      },
      {
        path: 'applications/:id',
        loadComponent: () => import('./features/applications/detail/application-detail.component')
          .then(m => m.ApplicationDetailComponent)
      }
    ]
  }
];