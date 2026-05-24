import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <i class="pi pi-user-plus logo"></i>
          <h1>Criar Conta</h1>
          <p>Preencha seus dados para começar</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-field">
            <label for="nome">Nome completo *</label>
            <input id="nome" pInputText formControlName="nome" placeholder="Seu nome completo" />
            @if (form.get('nome')?.touched && form.get('nome')?.invalid) {
              <small class="error">Nome obrigatório (mínimo 2 caracteres)</small>
            }
          </div>

          <div class="form-field">
            <label for="email">Email *</label>
            <input id="email" pInputText type="email" formControlName="email" placeholder="seu@email.com" />
            @if (form.get('email')?.touched && form.get('email')?.invalid) {
              <small class="error">Email inválido</small>
            }
          </div>

          <div class="form-field">
            <label for="senha">Senha *</label>
            <p-password
              formControlName="senha"
              [toggleMask]="true"
              styleClass="w-full"
              inputStyleClass="w-full"
              placeholder="Mínimo 6 caracteres"
            ></p-password>
            @if (form.get('senha')?.touched && form.get('senha')?.invalid) {
              <small class="error">Senha deve ter no mínimo 6 caracteres</small>
            }
          </div>

          <div class="form-field">
            <label for="telefone">Telefone</label>
            <input id="telefone" pInputText formControlName="telefone" placeholder="(11) 99999-9999" />
          </div>

          <div class="form-field">
            <label for="endereco">Endereço de entrega</label>
            <input id="endereco" pInputText formControlName="endereco" placeholder="Rua, número, bairro" />
          </div>

          <button
            pButton
            type="submit"
            label="Criar conta"
            icon="pi pi-check"
            [loading]="loading()"
            [disabled]="form.invalid"
            class="w-full"
          ></button>

          <div class="auth-footer">
            <span>Já tem conta?</span>
            <a routerLink="/login">Entrar</a>
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
      padding: 2rem;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.2);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .logo {
      font-size: 2.5rem;
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }

    .auth-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 0.25rem;
    }

    .auth-header p {
      color: var(--gray-500);
      font-size: 0.875rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
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

    .form-field input {
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
      margin-top: 0.5rem;
    }

    .auth-footer a {
      color: var(--primary-color);
      font-weight: 600;
      text-decoration: none;
      margin-left: 0.25rem;
    }
  `]
})
export class CadastroComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  loading = signal(false);

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    telefone: [''],
    endereco: ['']
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Conta criada!',
          detail: 'Faça login para continuar'
        });
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro no cadastro',
          detail: err.error?.message || 'Verifique os dados informados'
        });
      },
      complete: () => this.loading.set(false)
    });
  }
}
