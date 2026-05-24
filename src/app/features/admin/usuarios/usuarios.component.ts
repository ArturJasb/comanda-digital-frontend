import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminService } from '@core/services/admin.service';
import { UsuarioResponse } from '@core/models/models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, TableModule, DialogModule,
    InputTextModule, PasswordModule, DropdownModule, TagModule
  ],
  template: `
    <div class="page-header">
      <h1>Usuários Internos</h1>
      <button pButton label="Novo Usuário" icon="pi pi-plus" (click)="abrirNovo()"></button>
    </div>

    <p-table [value]="usuarios()" [loading]="loading()" styleClass="p-datatable-sm" [paginator]="true" [rows]="20">
      <ng-template pTemplate="header">
        <tr>
          <th>Nome</th>
          <th>Email</th>
          <th>Perfil</th>
          <th>Telefone</th>
          <th>Status</th>
          <th style="width: 150px">Ações</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-u>
        <tr>
          <td>{{ u.nome }}</td>
          <td>{{ u.email }}</td>
          <td><p-tag [value]="u.perfil" [severity]="perfilSeverity(u.perfil)"></p-tag></td>
          <td>{{ u.telefone || '-' }}</td>
          <td><p-tag [value]="u.status" [severity]="u.status === 'ATIVO' ? 'success' : 'danger'"></p-tag></td>
          <td>
            <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editar(u)"></button>
            <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" (click)="remover(u)"></button>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr><td colspan="6" class="text-center">Nenhum usuário cadastrado</td></tr>
      </ng-template>
    </p-table>

    <p-dialog [(visible)]="dialogVisible" [header]="editando() ? 'Editar Usuário' : 'Novo Usuário'"
              [modal]="true" [style]="{width: '600px'}">
      <form [formGroup]="form" (ngSubmit)="salvar()" class="form-grid">
        <div class="field">
          <label>Nome *</label>
          <input pInputText formControlName="nome">
        </div>
        <div class="row">
          <div class="field flex-1">
            <label>Email *</label>
            <input pInputText formControlName="email" type="email">
          </div>
          <div class="field flex-1">
            <label>Telefone</label>
            <input pInputText formControlName="telefone">
          </div>
        </div>
        <div class="field">
          <label>Perfil *</label>
          <p-dropdown formControlName="perfil" [options]="perfis" optionLabel="label" optionValue="value" [style]="{width: '100%'}"></p-dropdown>
        </div>
        <div class="field" *ngIf="!editando()">
          <label>Senha *</label>
          <p-password formControlName="senha" [toggleMask]="true" [feedback]="false" [style]="{width: '100%'}"></p-password>
        </div>
        <div class="dialog-footer">
          <button pButton type="button" label="Cancelar" class="p-button-text" (click)="dialogVisible = false"></button>
          <button pButton type="submit" label="Salvar" [loading]="salvando()" [disabled]="form.invalid"></button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .form-grid { display: flex; flex-direction: column; gap: 16px; }
    .row { display: flex; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-weight: 500; font-size: 0.875rem; }
    .flex-1 { flex: 1; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .text-center { text-align: center; padding: 24px; color: var(--text-secondary); }
  `]
})
export class UsuariosComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private confirmation = inject(ConfirmationService);
  private message = inject(MessageService);

  usuarios = signal<UsuarioResponse[]>([]);
  loading = signal(false);
  dialogVisible = false;
  editando = signal(false);
  salvando = signal(false);
  usuarioEditando: UsuarioResponse | null = null;

  perfis = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Gerente', value: 'GERENTE' },
    { label: 'Cozinheiro', value: 'COZINHEIRO' }
  ];

  form = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefone: [''],
    perfil: ['COZINHEIRO', Validators.required],
    senha: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.adminService.listarUsuarios().subscribe({
      next: p => { this.usuarios.set(p.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  perfilSeverity(p: string): any {
    return { ADMIN: 'danger', GERENTE: 'warning', COZINHEIRO: 'info', CLIENTE: 'success' }[p] || 'info';
  }

  abrirNovo() {
    this.editando.set(false);
    this.usuarioEditando = null;
    this.form.reset({ perfil: 'COZINHEIRO' });
    this.form.get('senha')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.get('senha')?.updateValueAndValidity();
    this.dialogVisible = true;
  }

  editar(u: UsuarioResponse) {
    this.editando.set(true);
    this.usuarioEditando = u;
    this.form.get('senha')?.clearValidators();
    this.form.get('senha')?.updateValueAndValidity();
    this.form.patchValue({ nome: u.nome, email: u.email, telefone: u.telefone, perfil: u.perfil, senha: '' });
    this.dialogVisible = true;
  }

  salvar() {
    if (this.form.invalid) return;
    this.salvando.set(true);
    const data: any = this.form.value;
    if (this.editando() && !data.senha) delete data.senha;

    const obs = this.editando() && this.usuarioEditando
      ? this.adminService.atualizarUsuario(this.usuarioEditando.id, data)
      : this.adminService.criarUsuario(data);

    obs.subscribe({
      next: () => {
        this.message.add({ severity: 'success', summary: 'Salvo' });
        this.dialogVisible = false;
        this.salvando.set(false);
        this.carregar();
      },
      error: () => this.salvando.set(false)
    });
  }

  remover(u: UsuarioResponse) {
    this.confirmation.confirm({
      message: `Desativar "${u.nome}"?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.adminService.removerUsuario(u.id).subscribe(() => {
          this.message.add({ severity: 'success', summary: 'Removido' });
          this.carregar();
        });
      }
    });
  }
}
