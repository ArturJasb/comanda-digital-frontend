import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminService } from '@core/services/admin.service';
import { PratoResponse, CategoriaResponse } from '@core/models/models';

@Component({
  selector: 'app-pratos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink, ButtonModule, TableModule,
    DialogModule, InputTextModule, InputTextareaModule, InputNumberModule, DropdownModule, TagModule
  ],
  template: `
    <div class="page-header">
      <h1>Pratos</h1>
      <button pButton label="Novo Prato" icon="pi pi-plus" (click)="abrirNovo()"></button>
    </div>

    <p-table [value]="pratos()" [loading]="loading()" styleClass="p-datatable-sm" [paginator]="true" [rows]="20">
      <ng-template pTemplate="header">
        <tr>
          <th style="width: 80px">Foto</th>
          <th>Nome</th>
          <th>Categoria</th>
          <th>Preço</th>
          <th>Tempo</th>
          <th>Status</th>
          <th style="width: 200px">Ações</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-p>
        <tr>
          <td>
            <img *ngIf="p.fotoUrl" [src]="p.fotoUrl" alt="" class="thumb">
            <div *ngIf="!p.fotoUrl" class="thumb-placeholder"><i class="pi pi-image"></i></div>
          </td>
          <td>
            <div class="prato-nome">{{ p.nome }}</div>
            <small>{{ p.descricao }}</small>
          </td>
          <td>{{ p.categoria?.nome }}</td>
          <td>{{ p.precoVenda | currency:'BRL' }}</td>
          <td>{{ p.tempoPreparoMin }} min</td>
          <td>
            <p-tag [value]="p.status" [severity]="statusSeverity(p.status)"></p-tag>
          </td>
          <td>
            <button pButton icon="pi pi-list" class="p-button-text p-button-sm" pTooltip="Ficha técnica"
                    [routerLink]="['/admin/pratos', p.id, 'ficha']"></button>
            <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editar(p)"></button>
            <button pButton icon="pi pi-power-off" class="p-button-text p-button-sm p-button-warning" (click)="alterarStatus(p)"></button>
            <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" (click)="remover(p)"></button>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr><td colspan="7" class="text-center">Nenhum prato cadastrado</td></tr>
      </ng-template>
    </p-table>

    <p-dialog [(visible)]="dialogVisible" [header]="editando() ? 'Editar Prato' : 'Novo Prato'"
              [modal]="true" [style]="{width: '700px'}" [closable]="!salvando()">
      <form [formGroup]="form" (ngSubmit)="salvar()" class="form-grid">
        <div class="field">
          <label>Nome *</label>
          <input pInputText formControlName="nome" placeholder="Ex: Hambúrguer Artesanal">
        </div>
        <div class="field">
          <label>Descrição</label>
          <textarea pInputTextarea formControlName="descricao" rows="3"></textarea>
        </div>
        <div class="row">
          <div class="field flex-1">
            <label>Categoria *</label>
            <p-dropdown formControlName="categoriaId" [options]="categorias()" optionLabel="nome"
                        optionValue="id" placeholder="Selecione" [style]="{width: '100%'}"></p-dropdown>
          </div>
          <div class="field flex-1">
            <label>Preço de venda *</label>
            <p-inputNumber formControlName="precoVenda" mode="currency" currency="BRL" locale="pt-BR"></p-inputNumber>
          </div>
          <div class="field flex-1">
            <label>Tempo (min) *</label>
            <p-inputNumber formControlName="tempoPreparoMin" [min]="1"></p-inputNumber>
          </div>
        </div>
        <div class="field">
          <label>URL da foto</label>
          <input pInputText formControlName="fotoUrl" placeholder="https://...">
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
    .thumb { width: 60px; height: 60px; object-fit: cover; border-radius: 8px; }
    .thumb-placeholder { width: 60px; height: 60px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8; }
    .prato-nome { font-weight: 500; }
    small { color: var(--text-secondary); font-size: 0.8rem; }
  `]
})
export class PratosComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private confirmation = inject(ConfirmationService);
  private message = inject(MessageService);

  pratos = signal<PratoResponse[]>([]);
  categorias = signal<CategoriaResponse[]>([]);
  loading = signal(false);
  dialogVisible = false;
  editando = signal(false);
  salvando = signal(false);
  pratoEditando: PratoResponse | null = null;

  form = this.fb.group({
    nome: ['', Validators.required],
    descricao: [''],
    categoriaId: [null as number | null, Validators.required],
    precoVenda: [0, [Validators.required, Validators.min(0.01)]],
    tempoPreparoMin: [15, [Validators.required, Validators.min(1)]],
    fotoUrl: ['']
  });

  ngOnInit() {
    this.carregar();
    this.adminService.listarCategorias().subscribe(p => this.categorias.set(p.content));
  }

  carregar() {
    this.loading.set(true);
    this.adminService.listarPratos().subscribe({
      next: (page) => { this.pratos.set(page.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  statusSeverity(s: string): any {
    return { ATIVO: 'success', INATIVO: 'danger', PAUSADO: 'warning' }[s] || 'info';
  }

  abrirNovo() {
    this.editando.set(false);
    this.pratoEditando = null;
    this.form.reset({ tempoPreparoMin: 15, precoVenda: 0 });
    this.dialogVisible = true;
  }

  editar(p: PratoResponse) {
    this.editando.set(true);
    this.pratoEditando = p;
    this.form.patchValue({
      nome: p.nome, descricao: p.descricao, categoriaId: p.categoria?.id,
      precoVenda: p.precoVenda, tempoPreparoMin: p.tempoPreparoMin, fotoUrl: p.fotoUrl
    });
    this.dialogVisible = true;
  }

  salvar() {
    if (this.form.invalid) return;
    this.salvando.set(true);
    const data: any = this.form.value;
    const obs = this.editando() && this.pratoEditando
      ? this.adminService.atualizarPrato(this.pratoEditando.id, data)
      : this.adminService.criarPrato(data);

    obs.subscribe({
      next: () => {
        this.message.add({ severity: 'success', summary: 'Salvo', detail: 'Prato salvo' });
        this.dialogVisible = false;
        this.salvando.set(false);
        this.carregar();
      },
      error: () => this.salvando.set(false)
    });
  }

  alterarStatus(p: PratoResponse) {
    const novoStatus = p.status === 'ATIVO' ? 'PAUSADO' : 'ATIVO';
    this.adminService.alterarStatusPrato(p.id, novoStatus).subscribe(() => {
      this.message.add({ severity: 'success', summary: 'Status alterado', detail: `Status: ${novoStatus}` });
      this.carregar();
    });
  }

  remover(p: PratoResponse) {
    this.confirmation.confirm({
      message: `Desativar "${p.nome}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.adminService.removerPrato(p.id).subscribe(() => {
          this.message.add({ severity: 'success', summary: 'Removido' });
          this.carregar();
        });
      }
    });
  }
}
