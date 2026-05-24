import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminService } from '@core/services/admin.service';
import { CompraResponse, FornecedorResponse, IngredienteResponse } from '@core/models/models';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, TableModule, DialogModule,
    DropdownModule, InputNumberModule, TagModule
  ],
  template: `
    <div class="page-header">
      <h1>Pedidos de Compra</h1>
      <button pButton label="Nova Compra" icon="pi pi-plus" (click)="abrirNova()"></button>
    </div>

    <p-table [value]="compras()" [loading]="loading()" styleClass="p-datatable-sm" [paginator]="true" [rows]="20">
      <ng-template pTemplate="header">
        <tr>
          <th>ID</th>
          <th>Fornecedor</th>
          <th>Data</th>
          <th>Itens</th>
          <th>Valor Total</th>
          <th>Status</th>
          <th style="width: 220px">Ações</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-c>
        <tr>
          <td>#{{ c.id }}</td>
          <td>{{ c.fornecedorRazaoSocial }}</td>
          <td>{{ c.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
          <td>{{ c.itens?.length || 0 }} item(ns)</td>
          <td><strong>{{ c.valorTotal | currency:'BRL' }}</strong></td>
          <td><p-tag [value]="c.status" [severity]="statusSeverity(c.status)"></p-tag></td>
          <td>
            <button pButton label="Enviar" class="p-button-sm p-button-outlined" *ngIf="c.status === 'RASCUNHO'" (click)="enviar(c)"></button>
            <button pButton label="Receber" icon="pi pi-check" class="p-button-sm p-button-success" *ngIf="c.status === 'ENVIADO'" (click)="receber(c)"></button>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr><td colspan="7" class="text-center">Nenhuma compra cadastrada</td></tr>
      </ng-template>
    </p-table>

    <p-dialog [(visible)]="dialogVisible" header="Nova Compra" [modal]="true" [style]="{width: '800px'}">
      <form [formGroup]="form" (ngSubmit)="salvar()" class="form-grid">
        <div class="field">
          <label>Fornecedor *</label>
          <p-dropdown formControlName="fornecedorId" [options]="fornecedores()" optionLabel="razaoSocial"
                      optionValue="id" placeholder="Selecione" [style]="{width: '100%'}" [filter]="true"></p-dropdown>
        </div>

        <h3>Itens</h3>
        <div formArrayName="itens">
          <div *ngFor="let item of itens.controls; let i = index" [formGroupName]="i" class="item-row">
            <div class="field flex-2">
              <label>Ingrediente</label>
              <p-dropdown formControlName="ingredienteId" [options]="ingredientes()" optionLabel="nome"
                          optionValue="id" placeholder="Selecione" [style]="{width: '100%'}" [filter]="true"></p-dropdown>
            </div>
            <div class="field" style="width: 120px">
              <label>Quantidade</label>
              <p-inputNumber formControlName="quantidade" [min]="0.001" [minFractionDigits]="0" [maxFractionDigits]="3"></p-inputNumber>
            </div>
            <div class="field" style="width: 150px">
              <label>Preço unitário</label>
              <p-inputNumber formControlName="precoUnitario" mode="currency" currency="BRL" locale="pt-BR" [minFractionDigits]="2" [maxFractionDigits]="4"></p-inputNumber>
            </div>
            <button pButton icon="pi pi-trash" class="p-button-text p-button-danger remove-btn" (click)="removerItem(i)"></button>
          </div>
        </div>
        <button pButton type="button" label="Adicionar item" icon="pi pi-plus" class="p-button-outlined p-button-sm" (click)="adicionarItem()"></button>

        <div class="dialog-footer">
          <button pButton type="button" label="Cancelar" class="p-button-text" (click)="dialogVisible = false"></button>
          <button pButton type="submit" label="Criar Compra (RASCUNHO)" [loading]="salvando()" [disabled]="form.invalid || itens.length === 0"></button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .form-grid { display: flex; flex-direction: column; gap: 16px; }
    .form-grid h3 { margin: 8px 0 0 0; font-size: 1rem; }
    .item-row { display: flex; gap: 12px; align-items: flex-end; padding: 12px; background: #f8fafc; border-radius: 8px; margin-bottom: 8px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-weight: 500; font-size: 0.75rem; color: var(--text-secondary); }
    .flex-2 { flex: 2; }
    .remove-btn { align-self: flex-end; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
    .text-center { text-align: center; padding: 24px; color: var(--text-secondary); }
  `]
})
export class ComprasComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private confirmation = inject(ConfirmationService);
  private message = inject(MessageService);

  compras = signal<CompraResponse[]>([]);
  fornecedores = signal<FornecedorResponse[]>([]);
  ingredientes = signal<IngredienteResponse[]>([]);
  loading = signal(false);
  dialogVisible = false;
  salvando = signal(false);

  form = this.fb.group({
    fornecedorId: [null as number | null, Validators.required],
    itens: this.fb.array([])
  });

  get itens(): FormArray { return this.form.get('itens') as FormArray; }

  ngOnInit() {
    this.carregar();
    this.adminService.listarFornecedores().subscribe(p => this.fornecedores.set(p.content));
    this.adminService.listarIngredientes().subscribe(p => this.ingredientes.set(p.content));
  }

  carregar() {
    this.loading.set(true);
    this.adminService.listarCompras().subscribe({
      next: p => { this.compras.set(p.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  statusSeverity(s: string): any {
    return { RASCUNHO: 'info', ENVIADO: 'warning', RECEBIDO: 'success', CANCELADO: 'danger' }[s] || 'info';
  }

  abrirNova() {
    this.form.reset();
    this.itens.clear();
    this.adicionarItem();
    this.dialogVisible = true;
  }

  adicionarItem() {
    this.itens.push(this.fb.group({
      ingredienteId: [null, Validators.required],
      quantidade: [0, [Validators.required, Validators.min(0.001)]],
      precoUnitario: [0, [Validators.required, Validators.min(0.01)]]
    }));
  }
  removerItem(i: number) { this.itens.removeAt(i); }

  salvar() {
    if (this.form.invalid) return;
    this.salvando.set(true);
    this.adminService.criarCompra(this.form.value as any).subscribe({
      next: () => {
        this.message.add({ severity: 'success', summary: 'Criada', detail: 'Compra criada em RASCUNHO' });
        this.dialogVisible = false;
        this.salvando.set(false);
        this.carregar();
      },
      error: () => this.salvando.set(false)
    });
  }

  enviar(c: CompraResponse) {
    this.confirmation.confirm({
      message: `Marcar compra #${c.id} como ENVIADA ao fornecedor?`,
      icon: 'pi pi-send',
      accept: () => {
        this.adminService.alterarStatusCompra(c.id, 'ENVIADO').subscribe(() => {
          this.message.add({ severity: 'success', summary: 'Enviada' });
          this.carregar();
        });
      }
    });
  }

  receber(c: CompraResponse) {
    this.confirmation.confirm({
      message: `Confirmar recebimento? Esta ação dará entrada no estoque.`,
      icon: 'pi pi-check',
      accept: () => {
        this.adminService.receberCompra(c.id).subscribe(() => {
          this.message.add({ severity: 'success', summary: 'Recebida', detail: 'Estoque atualizado' });
          this.carregar();
        });
      }
    });
  }
}
