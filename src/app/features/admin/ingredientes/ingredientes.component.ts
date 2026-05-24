import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminService } from '@core/services/admin.service';
import { IngredienteResponse } from '@core/models/models';

@Component({
  selector: 'app-ingredientes',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, TableModule,
    DialogModule, InputTextModule, InputNumberModule, DropdownModule, TagModule
  ],
  template: `
    <div class="page-header">
      <h1>Ingredientes</h1>
      <button pButton label="Novo Ingrediente" icon="pi pi-plus" (click)="abrirNovo()"></button>
    </div>

    <p-table [value]="ingredientes()" [loading]="loading()" styleClass="p-datatable-sm" [paginator]="true" [rows]="20">
      <ng-template pTemplate="header">
        <tr>
          <th>Nome</th>
          <th>SKU</th>
          <th>Unidade</th>
          <th>Estoque mín.</th>
          <th>Custo unitário</th>
          <th>Status</th>
          <th style="width: 150px">Ações</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-i>
        <tr>
          <td>{{ i.nome }}</td>
          <td><code>{{ i.sku }}</code></td>
          <td>{{ i.unidadePadrao }}</td>
          <td>{{ i.estoqueMinimo }}</td>
          <td>{{ i.custoUnitario | currency:'BRL' }}</td>
          <td>
            <p-tag [value]="i.status" [severity]="i.status === 'ATIVO' ? 'success' : 'danger'"></p-tag>
          </td>
          <td>
            <button pButton icon="pi pi-pencil" class="p-button-text p-button-sm" (click)="editar(i)"></button>
            <button pButton icon="pi pi-trash" class="p-button-text p-button-sm p-button-danger" (click)="remover(i)"></button>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr><td colspan="7" class="text-center">Nenhum ingrediente cadastrado</td></tr>
      </ng-template>
    </p-table>

    <p-dialog [(visible)]="dialogVisible" [header]="editando() ? 'Editar Ingrediente' : 'Novo Ingrediente'"
              [modal]="true" [style]="{width: '600px'}" [closable]="!salvando()">
      <form [formGroup]="form" (ngSubmit)="salvar()" class="form-grid">
        <div class="row">
          <div class="field flex-1">
            <label>Nome *</label>
            <input pInputText formControlName="nome" placeholder="Ex: Blend bovino">
          </div>
          <div class="field" style="width: 150px">
            <label>SKU *</label>
            <input pInputText formControlName="sku" placeholder="ING-001">
          </div>
        </div>

        <div class="row">
          <div class="field flex-1">
            <label>Unidade padrão *</label>
            <p-dropdown formControlName="unidadePadrao" [options]="unidades" optionLabel="label"
                        optionValue="value" placeholder="Selecione" [style]="{width: '100%'}"></p-dropdown>
          </div>
          <div class="field flex-1">
            <label>Estoque mínimo</label>
            <p-inputNumber formControlName="estoqueMinimo" [min]="0" [minFractionDigits]="0" [maxFractionDigits]="3"></p-inputNumber>
          </div>
          <div class="field flex-1">
            <label>Custo unitário</label>
            <p-inputNumber formControlName="custoUnitario" mode="currency" currency="BRL" locale="pt-BR" [minFractionDigits]="2" [maxFractionDigits]="4"></p-inputNumber>
          </div>
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
    code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 0.875rem; }
  `]
})
export class IngredientesComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private confirmation = inject(ConfirmationService);
  private message = inject(MessageService);

  ingredientes = signal<IngredienteResponse[]>([]);
  loading = signal(false);
  dialogVisible = false;
  editando = signal(false);
  salvando = signal(false);
  ingredienteEditando: IngredienteResponse | null = null;

  unidades = [
    { label: 'Gramas (g)', value: 'G' },
    { label: 'Mililitros (ml)', value: 'ML' },
    { label: 'Unidade (un)', value: 'UN' },
    { label: 'Quilograma (kg)', value: 'KG' },
    { label: 'Litro (L)', value: 'L' }
  ];

  form = this.fb.group({
    nome: ['', Validators.required],
    sku: ['', Validators.required],
    unidadePadrao: ['G', Validators.required],
    estoqueMinimo: [0],
    custoUnitario: [0]
  });

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.adminService.listarIngredientes().subscribe({
      next: (page) => { this.ingredientes.set(page.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  abrirNovo() {
    this.editando.set(false);
    this.ingredienteEditando = null;
    this.form.reset({ unidadePadrao: 'G', estoqueMinimo: 0, custoUnitario: 0 });
    this.dialogVisible = true;
  }

  editar(i: IngredienteResponse) {
    this.editando.set(true);
    this.ingredienteEditando = i;
    this.form.patchValue({
      nome: i.nome, sku: i.sku, unidadePadrao: i.unidadePadrao,
      estoqueMinimo: i.estoqueMinimo, custoUnitario: i.custoUnitario
    });
    this.dialogVisible = true;
  }

  salvar() {
    if (this.form.invalid) return;
    this.salvando.set(true);
    const data: any = this.form.value;
    const obs = this.editando() && this.ingredienteEditando
      ? this.adminService.atualizarIngrediente(this.ingredienteEditando.id, data)
      : this.adminService.criarIngrediente(data);

    obs.subscribe({
      next: () => {
        this.message.add({ severity: 'success', summary: 'Salvo', detail: 'Ingrediente salvo' });
        this.dialogVisible = false;
        this.salvando.set(false);
        this.carregar();
      },
      error: () => this.salvando.set(false)
    });
  }

  remover(i: IngredienteResponse) {
    this.confirmation.confirm({
      message: `Desativar "${i.nome}"?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.adminService.removerIngrediente(i.id).subscribe(() => {
          this.message.add({ severity: 'success', summary: 'Removido', detail: 'Ingrediente desativado' });
          this.carregar();
        });
      }
    });
  }
}
