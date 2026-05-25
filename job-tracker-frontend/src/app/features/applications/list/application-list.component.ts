import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';
import { ApplicationService } from '../../../core/services/application.service';
import { Application, ApplicationFilters, ApplicationStatus } from '../../../core/models/application.model';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, NgClass, ReactiveFormsModule],
  template: `
    <div class="container">

      <header class="page-header">
        <h1>Mes candidatures
          <span class="count">({{ totalElements() }})</span>
        </h1>
        <a routerLink="/applications/new" class="btn-primary">+ Nouvelle</a>
      </header>

      <!-- ── Barre de filtres ── -->
      <form [formGroup]="filterForm" class="filter-bar">

        <input
          formControlName="keyword"
          type="search"
          placeholder="Rechercher entreprise, poste, ville…"
          class="filter-search"
        />

        <select formControlName="status" class="filter-select">
          <option value="">Tous les statuts</option>
          @for (s of statuses; track s.value) {
            <option [value]="s.value">{{ s.label }}</option>
          }
        </select>

        <button type="button" (click)="resetFilters()" class="btn-ghost">
          Réinitialiser
        </button>

      </form>

      <!-- ── États ── -->
      @if (loading()) {
        <p class="state-message">Chargement…</p>
      }
      @if (error()) {
        <p class="state-message error">{{ error() }}</p>
      }
      @if (!loading() && applications().length === 0) {
        <p class="state-message">Aucun résultat pour ces filtres.</p>
      }

      <!-- ── Tableau ── -->
      @if (applications().length > 0) {
        <table class="table">
          <thead>
            <tr>
              <th (click)="sortBy('company')"   class="sortable">
                Entreprise {{ sortIcon('company') }}
              </th>
              <th (click)="sortBy('position')"  class="sortable">
                Poste {{ sortIcon('position') }}
              </th>
              <th>Statut</th>
              <th (click)="sortBy('applicationDate')" class="sortable">
                Date {{ sortIcon('applicationDate') }}
              </th>
              <th>Salaire</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (app of applications(); track app.id) {
              <tr>
                <td class="td-company">{{ app.company }}</td>
                <td>{{ app.position }}</td>
                <td>
                  <span class="badge" [ngClass]="statusClass(app.status)">
                    {{ statusLabel(app.status) }}
                  </span>
                </td>
                <td>{{ app.applicationDate | date: 'dd/MM/yyyy' }}</td>
                <td>{{ app.salary ? (app.salary | number) + ' €' : '—' }}</td>
                <td>
                  <a [routerLink]="['/applications', app.id]" class="link">
                    Voir →
                  </a>
                </td>
              </tr>
            }
          </tbody>
        </table>

        <!-- ── Pagination ── -->
        <div class="pagination">
          <button (click)="prevPage()" [disabled]="page() === 0">← Précédent</button>
          <span>Page {{ page() + 1 }} / {{ totalPages() }}</span>
          <button (click)="nextPage()" [disabled]="page() + 1 >= totalPages()">Suivant →</button>
        </div>
      }

    </div>
  `
})
export class ApplicationListComponent implements OnInit {

  private readonly applicationService = inject(ApplicationService);
  private readonly fb = inject(FormBuilder);

  // ── State ──
  applications = signal<Application[]>([]);
  loading      = signal(false);
  error        = signal<string | null>(null);
  page         = signal(0);
  totalPages   = signal(0);
  totalElements = signal(0);
  currentSort  = signal<{ field: string; dir: 'asc' | 'desc' }>({
    field: 'createdAt',
    dir: 'desc'
  });

  // ── Formulaire filtres ──
  filterForm = this.fb.group({
    keyword: [''],
    status:  ['' as ApplicationStatus | '']
  });

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
    // Déclencher la recherche après 300ms d'inactivité
    // et seulement si les valeurs ont vraiment changé
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    ).subscribe(() => {
      this.page.set(0);  // reset page à chaque nouveau filtre
      this.load();
    });

    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    const { keyword, status } = this.filterForm.getRawValue();
    const sort = this.currentSort();
    const filters: ApplicationFilters = { keyword: keyword ?? '', status: status ?? '' };

    this.applicationService.search(filters, this.page()).subscribe({
      next: (pageData) => {
        this.applications.set(pageData.content);
        this.totalPages.set(pageData.totalPages);
        this.totalElements.set(pageData.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les candidatures.');
        this.loading.set(false);
      }
    });
  }

  prevPage(): void { this.page.update(p => p - 1); this.load(); }
  nextPage(): void { this.page.update(p => p + 1); this.load(); }

  resetFilters(): void {
    this.filterForm.reset({ keyword: '', status: '' });
    this.page.set(0);
  }

  sortBy(field: string): void {
    this.currentSort.update(s => ({
      field,
      dir: s.field === field && s.dir === 'asc' ? 'desc' : 'asc'
    }));
    this.load();
  }

  sortIcon(field: string): string {
    const s = this.currentSort();
    if (s.field !== field) return '↕';
    return s.dir === 'asc' ? '↑' : '↓';
  }

  statusLabel(status: ApplicationStatus): string {
    return this.statuses.find(s => s.value === status)?.label ?? status;
  }

  statusClass(status: string): string {
    const classes: Record<string, string> = {
      SAVED: 'badge--gray', APPLIED: 'badge--blue',
      HR_INTERVIEW: 'badge--yellow', TECH_INTERVIEW: 'badge--orange',
      FINAL_INTERVIEW: 'badge--purple', OFFER: 'badge--green',
      REJECTED: 'badge--red'
    };
    return classes[status] ?? '';
  }
}