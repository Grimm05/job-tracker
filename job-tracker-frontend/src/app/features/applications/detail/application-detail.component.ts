import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ApplicationService } from '../../../core/services/application.service';
import { Application, ApplicationStatus } from '../../../core/models/application.model';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, ReactiveFormsModule],
  template: `
    <div class="container container--narrow">

      @if (loading()) {
        <p class="state-message">Chargement…</p>
      }

      @if (error()) {
        <p class="state-message error">{{ error() }}</p>
      }

      @if (application()) {
        <header class="page-header">
          <div>
            <h1>{{ application()!.position }}</h1>
            <p class="sub">{{ application()!.company }}
              @if (application()!.location) {
                · {{ application()!.location }}
              }
            </p>
          </div>
          <a routerLink="/applications" class="btn-ghost">← Retour</a>
        </header>

        <!-- ── Infos ── -->
        <div class="detail-grid">

          <div class="detail-item">
            <span class="detail-label">Statut</span>
            <select [value]="application()!.status"
                    (change)="onStatusChange($event)"
                    class="status-select">
              @for (s of statuses; track s.value) {
                <option [value]="s.value">{{ s.label }}</option>
              }
            </select>
          </div>

          <div class="detail-item">
            <span class="detail-label">Salaire</span>
            <span>{{ application()!.salary ? application()!.salary + ' €' : '—' }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">Date candidature</span>
            <span>{{ application()!.applicationDate | date: 'dd/MM/yyyy' }}</span>
          </div>

          <div class="detail-item">
            <span class="detail-label">Annonce</span>
            @if (application()!.jobUrl) {
              <a [href]="application()!.jobUrl" target="_blank" rel="noopener">
                Voir l'annonce →
              </a>
            } @else {
              <span>—</span>
            }
          </div>

        </div>

        <!-- ── Notes ── -->
        @if (application()!.notes) {
          <div class="detail-notes">
            <span class="detail-label">Notes</span>
            <p>{{ application()!.notes }}</p>
          </div>
        }

        <!-- ── Dates audit ── -->
        <p class="audit-info">
          Créée le {{ application()!.createdAt | date: 'dd/MM/yyyy HH:mm' }}
          · Modifiée le {{ application()!.updatedAt | date: 'dd/MM/yyyy HH:mm' }}
        </p>

        <!-- ── Actions ── -->
        <div class="detail-actions">
          <button class="btn-danger" (click)="onDelete()" [disabled]="deleting()">
            {{ deleting() ? 'Suppression…' : 'Supprimer' }}
          </button>
        </div>
      }

    </div>
  `
})
export class ApplicationDetailComponent implements OnInit {

  private readonly route              = inject(ActivatedRoute);
  private readonly router             = inject(Router);
  private readonly applicationService = inject(ApplicationService);

  application = signal<Application | null>(null);
  loading     = signal(false);
  error       = signal<string | null>(null);
  deleting    = signal(false);

  statuses = [
    { value: 'SAVED',           label: 'Sauvegardé' },
    { value: 'APPLIED',         label: 'Postulé' },
    { value: 'HR_INTERVIEW',    label: 'Entretien RH' },
    { value: 'TECH_INTERVIEW',  label: 'Entretien technique' },
    { value: 'FINAL_INTERVIEW', label: 'Entretien final' },
    { value: 'OFFER',           label: 'Offre reçue' },
    { value: 'REJECTED',        label: 'Refusé' }
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  private load(id: string): void {
    this.loading.set(true);

    this.applicationService.findById(id).subscribe({
      next: (app) => {
        this.application.set(app);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Candidature introuvable.');
        this.loading.set(false);
      }
    });
  }

  onStatusChange(event: Event): void {
    const status = (event.target as HTMLSelectElement).value as ApplicationStatus;
    const app    = this.application()!;

    this.applicationService.update(app.id, { status }).subscribe({
      next: (updated) => this.application.set(updated)
    });
  }

  onDelete(): void {
    if (!confirm('Supprimer cette candidature ?')) return;

    this.deleting.set(true);

    this.applicationService.delete(this.application()!.id).subscribe({
      next: () => this.router.navigate(['/applications']),
      error: () => this.deleting.set(false)
    });
  }
}