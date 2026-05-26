import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { DashboardStats } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  styles: [`
    .dashboard { padding: 2rem; max-width: 1100px; margin: 0 auto; }

    h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.25rem; }
    .subtitle { color: #6b7280; margin-bottom: 2rem; }

    /* ── KPI cards ── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .kpi-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .kpi-card.accent-blue   { border-top: 3px solid #3b82f6; }
    .kpi-card.accent-yellow { border-top: 3px solid #f59e0b; }
    .kpi-card.accent-purple { border-top: 3px solid #8b5cf6; }
    .kpi-card.accent-green  { border-top: 3px solid #10b981; }
    .kpi-card.accent-red    { border-top: 3px solid #ef4444; }
    .kpi-card.accent-gray   { border-top: 3px solid #6b7280; }

    .kpi-label  { font-size: 0.75rem; text-transform: uppercase;
                  letter-spacing: .05em; color: #6b7280; }
    .kpi-value  { font-size: 2rem; font-weight: 800; color: #111827; }
    .kpi-sub    { font-size: 0.75rem; color: #9ca3af; }

    /* ── Panels ── */
    .panels {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 700px) { .panels { grid-template-columns: 1fr; } }

    .panel {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 1.5rem;
    }
    .panel h2 { font-size: 1rem; font-weight: 600; margin-bottom: 1.25rem; }

    /* ── Breakdown bars ── */
    .breakdown-row { margin-bottom: 0.875rem; }
    .breakdown-header {
      display: flex; justify-content: space-between;
      font-size: 0.8rem; margin-bottom: 0.3rem;
    }
    .bar-track {
      height: 8px; background: #f3f4f6;
      border-radius: 99px; overflow: hidden;
    }
    .bar-fill {
      height: 100%; border-radius: 99px;
      transition: width 0.6s ease;
    }

    /* ── Rates ── */
    .rate-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .rate-card {
      background: #f9fafb; border-radius: 10px;
      padding: 1rem; text-align: center;
    }
    .rate-value { font-size: 2.25rem; font-weight: 800; }
    .rate-label { font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem; }
    .rate-card.good .rate-value { color: #10b981; }
    .rate-card.warn .rate-value { color: #f59e0b; }

    /* ── CTA ── */
    .cta { margin-top: 1.5rem; text-align: right; }
    .btn-primary {
      background: #3b82f6; color: white; padding: 0.6rem 1.25rem;
      border-radius: 8px; text-decoration: none; font-size: 0.875rem;
    }
  `],
  template: `
    <div class="dashboard">

      <h1>Dashboard</h1>
      <p class="subtitle">Vue d'ensemble de ta recherche d'emploi</p>

      @if (loading()) { <p>Chargement…</p> }

      @if (stats()) {

        <!-- ── KPI ── -->
        <div class="kpi-grid">
          <div class="kpi-card accent-gray">
            <span class="kpi-label">Total</span>
            <span class="kpi-value">{{ stats()!.total }}</span>
            <span class="kpi-sub">candidatures</span>
          </div>
          <div class="kpi-card accent-blue">
            <span class="kpi-label">Postulées</span>
            <span class="kpi-value">{{ stats()!.applied }}</span>
            <span class="kpi-sub">envoyées</span>
          </div>
          <div class="kpi-card accent-purple">
            <span class="kpi-label">En cours</span>
            <span class="kpi-value">{{ stats()!.inProgress }}</span>
            <span class="kpi-sub">entretiens</span>
          </div>
          <div class="kpi-card accent-green">
            <span class="kpi-label">Offres</span>
            <span class="kpi-value">{{ stats()!.offers }}</span>
            <span class="kpi-sub">reçues</span>
          </div>
          <div class="kpi-card accent-red">
            <span class="kpi-label">Refus</span>
            <span class="kpi-value">{{ stats()!.rejected }}</span>
            <span class="kpi-sub">reçus</span>
          </div>
        </div>

        <div class="panels">

          <!-- ── Breakdown ── -->
          <div class="panel">
            <h2>Répartition par statut</h2>

            @for (row of breakdown(); track row.label) {
              <div class="breakdown-row">
                <div class="breakdown-header">
                  <span>{{ row.label }}</span>
                  <span>{{ row.count }} ({{ row.pct | number:'1.0-0' }}%)</span>
                </div>
                <div class="bar-track">
                  <div class="bar-fill"
                       [style.width.%]="row.pct"
                       [style.background]="row.color">
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- ── Taux ── -->
          <div class="panel">
            <h2>Indicateurs clés</h2>
            <div class="rate-grid">
              <div class="rate-card" [class.good]="stats()!.responseRate >= 50"
                                     [class.warn]="stats()!.responseRate < 50">
                <div class="rate-value">{{ stats()!.responseRate }}%</div>
                <div class="rate-label">Taux de réponse</div>
              </div>
              <div class="rate-card" [class.good]="stats()!.successRate >= 30"
                                     [class.warn]="stats()!.successRate < 30">
                <div class="rate-value">{{ stats()!.successRate }}%</div>
                <div class="rate-label">Taux de succès</div>
              </div>
            </div>

            <div class="cta">
              <a routerLink="/applications" class="btn-primary">
                Voir toutes les candidatures →
              </a>
            </div>
          </div>

        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {

  private readonly dashboardService = inject(DashboardService);

  stats   = signal<DashboardStats | null>(null);
  loading = signal(false);

  private readonly statusConfig = [
    { key: 'SAVED',           label: 'Sauvegardé',       color: '#9ca3af' },
    { key: 'APPLIED',         label: 'Postulé',           color: '#3b82f6' },
    { key: 'HR_INTERVIEW',    label: 'Entretien RH',      color: '#f59e0b' },
    { key: 'TECH_INTERVIEW',  label: 'Entretien Tech',    color: '#f97316' },
    { key: 'FINAL_INTERVIEW', label: 'Entretien Final',   color: '#8b5cf6' },
    { key: 'OFFER',           label: 'Offre',             color: '#10b981' },
    { key: 'REJECTED',        label: 'Refusé',            color: '#ef4444' },
  ];

  breakdown() {
    const s = this.stats();
    if (!s || s.total === 0) return [];
    return this.statusConfig.map(cfg => ({
      label: cfg.label,
      color: cfg.color,
      count: s.byStatus[cfg.key] ?? 0,
      pct:   ((s.byStatus[cfg.key] ?? 0) / s.total) * 100
    })).filter(r => r.count > 0);
  }

  ngOnInit(): void {
    this.loading.set(true);
    this.dashboardService.getStats().subscribe({
      next:  (data) => { this.stats.set(data); this.loading.set(false); },
      error: ()     => this.loading.set(false)
    });
  }
}