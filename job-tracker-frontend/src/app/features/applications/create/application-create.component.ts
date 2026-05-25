import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApplicationService } from '../../../core/services/application.service';

@Component({
  selector: 'app-application-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="container container--narrow">

      <header class="page-header">
        <h1>Nouvelle candidature</h1>
        <a routerLink="/applications">← Retour</a>
      </header>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">

        <div class="form-group">
          <label for="company">Entreprise *</label>
          <input id="company" formControlName="company" type="text" />
          @if (form.get('company')?.invalid && form.get('company')?.touched) {
            <span class="field-error">L'entreprise est requise</span>
          }
        </div>

        <div class="form-group">
          <label for="position">Poste *</label>
          <input id="position" formControlName="position" type="text" />
          @if (form.get('position')?.invalid && form.get('position')?.touched) {
            <span class="field-error">Le poste est requis</span>
          }
        </div>

        <div class="form-group">
          <label for="status">Statut *</label>
          <select id="status" formControlName="status">
            @for (s of statuses; track s.value) {
              <option [value]="s.value">{{ s.label }}</option>
            }
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="salary">Salaire (€)</label>
            <input id="salary" formControlName="salary" type="number" />
          </div>
          <div class="form-group">
            <label for="location">Localisation</label>
            <input id="location" formControlName="location" type="text" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="applicationDate">Date de candidature</label>
            <input id="applicationDate" formControlName="applicationDate" type="date" />
          </div>
          <div class="form-group">
            <label for="jobUrl">Lien annonce</label>
            <input id="jobUrl" formControlName="jobUrl" type="url" />
          </div>
        </div>

        <div class="form-group">
          <label for="notes">Notes</label>
          <textarea id="notes" formControlName="notes" rows="4"></textarea>
        </div>

        @if (error()) {
          <p class="form-error">{{ error() }}</p>
        }

        <div class="form-actions">
          <button type="submit" class="btn-primary" [disabled]="form.invalid || submitting()">
            {{ submitting() ? 'Enregistrement…' : 'Créer la candidature' }}
          </button>
        </div>

      </form>
    </div>
  `
})
export class ApplicationCreateComponent {

  private readonly fb = inject(FormBuilder);
  private readonly applicationService = inject(ApplicationService);
  private readonly router = inject(Router);

  submitting = signal(false);
  error = signal<string | null>(null);

  statuses = [
    { value: 'SAVED',            label: 'Sauvegardé' },
    { value: 'APPLIED',          label: 'Postulé' },
    { value: 'HR_INTERVIEW',     label: 'Entretien RH' },
    { value: 'TECH_INTERVIEW',   label: 'Entretien technique' },
    { value: 'FINAL_INTERVIEW',  label: 'Entretien final' },
    { value: 'OFFER',            label: 'Offre reçue' },
    { value: 'REJECTED',         label: 'Refusé' }
  ];

  form = this.fb.group({
    company:         ['', Validators.required],
    position:        ['', Validators.required],
    status:          ['SAVED', Validators.required],
    salary:          [null as number | null],
    location:        [''],
    applicationDate: [''],
    jobUrl:          [''],
    notes:           ['']
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.submitting.set(true);
    this.error.set(null);

    this.applicationService.create(this.form.getRawValue() as any).subscribe({
      next: (created) => {
        this.router.navigate(['/applications', created.id]);
      },
      error: () => {
        this.error.set('Erreur lors de la création. Réessaie.');
        this.submitting.set(false);
      }
    });
  }
}