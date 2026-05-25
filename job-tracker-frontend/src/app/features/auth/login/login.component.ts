import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">

        <h1 class="auth-title">Connexion</h1>
        <p class="auth-sub">Pas encore de compte ?
          <a routerLink="/auth/register">Créer un compte</a>
        </p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">

          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" formControlName="email" type="email" />
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input id="password" formControlName="password" type="password" />
          </div>

          @if (error()) {
            <p class="form-error">{{ error() }}</p>
          }

          <button type="submit" class="btn-primary btn-full"
                  [disabled]="form.invalid || loading()">
            {{ loading() ? 'Connexion…' : 'Se connecter' }}
          </button>

        </form>
      </div>
    </div>
  `
})
export class LoginComponent {

  private readonly fb          = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  loading = signal(false);
  error   = signal<string | null>(null);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.getRawValue();

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/applications']),
      error: () => {
        this.error.set('Email ou mot de passe incorrect.');
        this.loading.set(false);
      }
    });
  }
}