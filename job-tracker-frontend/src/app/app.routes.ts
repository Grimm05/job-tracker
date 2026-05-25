import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  { path: '', redirectTo: 'applications', pathMatch: 'full' },
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
  {
    path: 'applications',
    canActivate: [authGuard],     // ← toutes les routes applications protégées
    children: [
      { path: '', loadComponent: () => import('./features/applications/list/application-list.component').then(m => m.ApplicationListComponent) },
      { path: 'new', loadComponent: () => import('./features/applications/create/application-create.component').then(m => m.ApplicationCreateComponent) },
      { path: ':id', loadComponent: () => import('./features/applications/detail/application-detail.component').then(m => m.ApplicationDetailComponent) }
    ]
  }
];