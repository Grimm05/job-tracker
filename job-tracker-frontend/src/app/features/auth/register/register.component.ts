import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">

        <h1 class="auth-title">Créer un compte</h1>
        <p class="auth-sub">Déjà un compte ?
          <a routerLink="/auth/login">Se connecter</a>
        </p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">

          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Prénom</label>
              <input id="firstName" formControlName="firstName" type="text" />
            </div>
            <div class="form-group">
              <label for="lastName">Nom</label>
              <input id="lastName" formControlName="lastName" type="text" />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" formControlName="email" type="email" />
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <span class="field-error">Email invalide</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input id="password" formControlName="password" type="password" />
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <span class="field-error">8 caractères minimum</span>
            }
          </div>

          @if (error()) {
            <p class="form-error">{{ error() }}</p>
          }

          <button type="submit" class="btn-primary btn-full"
                  [disabled]="form.invalid || loading()">
            {{ loading() ? 'Création…' : 'Créer mon compte' }}
          </button>

        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {

  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  loading = signal(false);
  error   = signal<string | null>(null);

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const { firstName, lastName, email, password } = this.form.getRawValue();

    this.authService.register({
      firstName: firstName!,
      lastName:  lastName!,
      email:     email!,
      password:  password!
    }).subscribe({
      next: () => this.router.navigate(['/applications']),
      error: (err) => {
        this.error.set(
          err.status === 400
            ? 'Cet email est déjà utilisé.'
            : 'Erreur lors de la création du compte.'
        );
        this.loading.set(false);
      }
    });
  }
}