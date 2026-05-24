import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminService } from '@core/services/admin.service';
import { CategoriaResponse } from '@core/models/models';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, TableModule,
    DialogModule, InputTextModule, InputTextareaModule, InputNumberModule, TagModule
  ],
  template: `
    <div class="page-header">
      <h1>Categorias</h1>
      <button pButton label="Nova Categoria" icon="pi pi-plus" (click)="abrirNovo()"></button>
    </div>

    <p-table [value]="categorias()" [loading]="loading()" styleClass="p-datatable-sm">
      <ng-template pTemplate="header">
        <tr>
          <th>Nome</th>
          <th>Descrição</th>
          <th>Ordem</th>
          <th>Status</th>
          <th style="width: 150px">Ações</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-c>
        <tr>
          <td>{{ c.nome }}</td>
          <td>{{ c.descricao || '-' }}</td>
          <td>{{ c.ordem }}</td>
          <td>
            <p-tag [value]="c.status" [severity]="c.status === 'ATIVO' ? 'success' : 'danger'"></p-tag>
          </td>
          <td>
            <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editar(c)"></button>
            <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" (click)="remover(c)"></button>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr><td colspan="5" class="text-center">Nenhuma categoria cadastrada</td></tr>
      </ng-template>
    </p-table>

    <p-dialog [(visible)]="dialogVisible" [header]="editando() ? 'Editar Categoria' : 'Nova Categoria'"
              [modal]="true" [style]="{width: '500px'}" [closable]="!salvando()">
      <form [formGroup]="form" (ngSubmit)="salvar()" class="form-grid">
        <div class="field">
          <label>Nome *</label>
          <input pInputText formControlName="nome" placeholder="Ex: Lanches">
        </div>
        <div class="field">
          <label>Descrição</label>
          <textarea pInputTextarea formControlName="descricao" rows="3"></textarea>
        </div>
        <div class="field">
          <label>Ordem de exibição</label>
          <p-inputNumber formControlName="ordem" [min]="0"></p-inputNumber>
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
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-weight: 500; font-size: 0.875rem; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .text-center { text-align: center; padding: 24px; color: var(--text-secondary); }
  `]
})
export class CategoriasComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private confirmation = inject(ConfirmationService);
  private message = inject(MessageService);

  categorias = signal<CategoriaResponse[]>([]);
  loading = signal(false);
  dialogVisible = false;
  editando = signal(false);
  salvando = signal(false);
  categoriaEditando: CategoriaResponse | null = null;

  form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    descricao: [''],
    ordem: [0]
  });

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.adminService.listarCategorias().subscribe({
      next: (page) => { this.categorias.set(page.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  abrirNovo() {
    this.editando.set(false);
    this.categoriaEditando = null;
    this.form.reset({ ordem: 0 });
    this.dialogVisible = true;
  }

  editar(c: CategoriaResponse) {
    this.editando.set(true);
    this.categoriaEditando = c;
    this.form.patchValue({ nome: c.nome, descricao: c.descricao || '', ordem: c.ordem });
    this.dialogVisible = true;
  }

  salvar() {
    if (this.form.invalid) return;
    this.salvando.set(true);
    const data: any = this.form.value;
    const obs = this.editando() && this.categoriaEditando
      ? this.adminService.atualizarCategoria(this.categoriaEditando.id, data)
      : this.adminService.criarCategoria(data);

    obs.subscribe({
      next: () => {
        this.message.add({ severity: 'success', summary: 'Salvo', detail: 'Categoria salva com sucesso' });
        this.dialogVisible = false;
        this.salvando.set(false);
        this.carregar();
      },
      error: () => this.salvando.set(false)
    });
  }

  remover(c: CategoriaResponse) {
    this.confirmation.confirm({
      message: `Desativar a categoria "${c.nome}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.adminService.removerCategoria(c.id).subscribe(() => {
          this.message.add({ severity: 'success', summary: 'Removido', detail: 'Categoria desativada' });
          this.carregar();
        });
      }
    });
  }
}
