import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule, CardModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <i class="pi pi-shopping-bag logo"></i>
          <h1>Comanda Digital</h1>
          <p>Acesse sua conta para continuar</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-field">
            <label for="email">Email</label>
            <input
              id="email"
              pInputText
              type="email"
              formControlName="email"
              placeholder="seu@email.com"
              [class.ng-invalid]="form.get('email')?.touched && form.get('email')?.invalid"
            />
            @if (form.get('email')?.touched && form.get('email')?.invalid) {
              <small class="error">Email inválido</small>
            }
          </div>

          <div class="form-field">
            <label for="senha">Senha</label>
            <p-password
              formControlName="senha"
              [feedback]="false"
              [toggleMask]="true"
              styleClass="w-full"
              inputStyleClass="w-full"
              placeholder="Sua senha"
            ></p-password>
            @if (form.get('senha')?.touched && form.get('senha')?.invalid) {
              <small class="error">Senha obrigatória</small>
            }
          </div>

          <button
            pButton
            type="submit"
            label="Entrar"
            icon="pi pi-sign-in"
            [loading]="loading()"
            [disabled]="form.invalid"
            class="w-full"
          ></button>

          <div class="auth-footer">
            <span>Ainda não tem conta?</span>
            <a routerLink="/cadastro">Cadastre-se</a>
          </div>

          <div class="back-link">
            <a routerLink="/cardapio">
              <i class="pi pi-arrow-left"></i>
              Voltar para o cardápio
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color-dark) 100%);
      padding: 1rem;
    }

    .auth-card {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.2);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      font-size: 3rem;
      color: var(--primary-color);
      margin-bottom: 1rem;
    }

    .auth-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .auth-header p {
      color: var(--gray-500);
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .form-field label {
      font-weight: 500;
      font-size: 0.875rem;
      color: var(--gray-700);
    }

    .form-field input,
    .form-field :host ::ng-deep .p-password,
    .form-field :host ::ng-deep .p-password input {
      width: 100%;
    }

    .error {
      color: var(--danger-color);
      font-size: 0.75rem;
    }

    .auth-footer {
      text-align: center;
      font-size: 0.875rem;
      color: var(--gray-600);
    }

    .auth-footer a {
      color: var(--primary-color);
      font-weight: 600;
      text-decoration: none;
      margin-left: 0.25rem;
    }

    .back-link {
      text-align: center;
      margin-top: 0.5rem;
    }

    .back-link a {
      color: var(--gray-500);
      font-size: 0.875rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }

    .back-link a:hover {
      color: var(--primary-color);
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  loading = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]]
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Bem-vindo!',
          detail: `Olá, ${res.nome}`
        });

        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl) {
          this.router.navigateByUrl(returnUrl);
        } else if (res.perfil === 'CLIENTE') {
          this.router.navigate(['/cardapio']);
        } else {
          this.router.navigate(['/admin/dashboard']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Falha no login',
          detail: err.error?.message || 'Email ou senha inválidos'
        });
      }
    });
  }
}
