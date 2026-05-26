import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  styles: [`
    .app-shell {
      display: flex;
      min-height: 100vh;
      background: #f9fafb;
      font-family: 'Inter', system-ui, sans-serif;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 240px;
      background: white;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
      position: fixed;
      top: 0; left: 0; bottom: 0;
    }

    .logo {
      font-size: 1.1rem;
      font-weight: 800;
      color: #111827;
      padding: 0 0.5rem;
      margin-bottom: 2rem;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .logo-dot { color: #3b82f6; }

    .nav { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #6b7280;
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
    }
    .nav-link:hover       { background: #f3f4f6; color: #111827; }
    .nav-link.active      { background: #eff6ff; color: #3b82f6; }
    .nav-link .icon       { font-size: 1.1rem; width: 20px; text-align: center; }

    .sidebar-footer { border-top: 1px solid #e5e7eb; padding-top: 1rem; }

    .user-info {
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
      color: #9ca3af;
      margin-bottom: 0.5rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
      padding: 0.625rem 0.75rem;
      border-radius: 8px;
      border: none;
      background: none;
      font-size: 0.875rem;
      font-weight: 500;
      color: #ef4444;
      cursor: pointer;
      transition: background 0.15s;
      text-align: left;
    }
    .btn-logout:hover { background: #fef2f2; }

    /* ── Main content ── */
    .main-content {
      margin-left: 240px;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .topbar {
      height: 56px;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .topbar-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: #374151;
    }

    .page-wrapper { padding: 2rem; flex: 1; }

    /* ── Mobile (sidebar collapse) ── */
    @media (max-width: 768px) {
      .sidebar       { display: none; }
      .main-content  { margin-left: 0; }
    }
  `],
  template: `
    <div class="app-shell">

      <!-- ── Sidebar ── -->
      <aside class="sidebar">
        <a routerLink="/dashboard" class="logo">
          TrackHire<span class="logo-dot">.</span>
        </a>

        <nav class="nav">
          <a routerLink="/dashboard"
             routerLinkActive="active"
             class="nav-link">
            <span class="icon">📊</span>
            Dashboard
          </a>
          <a routerLink="/applications"
             routerLinkActive="active"
             class="nav-link">
            <span class="icon">📋</span>
            Candidatures
          </a>
          <a routerLink="/applications/new"
             routerLinkActive="active"
             class="nav-link">
            <span class="icon">➕</span>
            Nouvelle
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">{{ userEmail() }}</div>
          <button class="btn-logout" (click)="logout()">
            <span class="icon">🚪</span>
            Déconnexion
          </button>
        </div>
      </aside>

      <!-- ── Contenu principal ── -->
      <div class="main-content">
        <header class="topbar">
          <span class="topbar-title">{{ pageTitle() }}</span>
        </header>

        <main class="page-wrapper">
          <router-outlet />
        </main>
      </div>

    </div>
  `
})
export class MainLayoutComponent {

  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  userEmail = this.authService.token()
    ? signal(this.getUserEmail())
    : signal('');

  private getUserEmail(): string {
    try {
      const token = this.authService.token();
      if (!token) return '';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub ?? '';
    } catch {
      return '';
    }
  }

  pageTitle(): string {
    const url = this.router.url;
    if (url.includes('dashboard'))        return 'Dashboard';
    if (url.includes('applications/new')) return 'Nouvelle candidature';
    if (url.includes('applications/'))    return 'Détail candidature';
    if (url.includes('applications'))     return 'Mes candidatures';
    return 'TrackHire';
  }

  logout(): void {
    this.authService.logout();
  }
}