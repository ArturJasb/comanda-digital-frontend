import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { MessageService } from 'primeng/api';
import { AdminService } from '@core/services/admin.service';

@Component({
  selector: 'app-estoque',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, TableModule, CardModule,
    DialogModule, DropdownModule, InputNumberModule, InputTextareaModule, TagModule, TabViewModule
  ],
  template: `
    <div class="page-header">
      <h1>Controle de Estoque</h1>
      <button pButton label="Saída Manual" icon="pi pi-minus-circle" (click)="abrirSaida()"></button>
    </div>

    <p-tabView>
      <p-tabPanel header="Saldo atual">
        <p-table [value]="saldos()" [loading]="loading()" styleClass="p-datatable-sm" [paginator]="true" [rows]="20">
          <ng-template pTemplate="header">
            <tr>
              <th>Ingrediente</th>
              <th>Unidade</th>
              <th>Saldo atual</th>
              <th>Estoque mínimo</th>
              <th>Status</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-s>
            <tr [class.row-alerta]="s.saldoAtual < s.estoqueMinimo">
              <td>{{ s.nome }}</td>
              <td>{{ s.unidadePadrao }}</td>
              <td><strong>{{ s.saldoAtual | number:'1.0-3' }}</strong></td>
              <td>{{ s.estoqueMinimo | number:'1.0-3' }}</td>
              <td>
                <p-tag *ngIf="s.saldoAtual >= s.estoqueMinimo" severity="success" value="OK"></p-tag>
                <p-tag *ngIf="s.saldoAtual < s.estoqueMinimo" severity="danger" value="ABAIXO DO MÍNIMO"></p-tag>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="5" class="text-center">Nenhum saldo disponível</td></tr>
          </ng-template>
        </p-table>
      </p-tabPanel>

      <p-tabPanel [header]="'Alertas (' + alertas().length + ')'">
        <p-table [value]="alertas()" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Ingrediente</th>
              <th>Saldo atual</th>
              <th>Estoque mínimo</th>
              <th>Diferença</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-a>
            <tr>
              <td>{{ a.nome }}</td>
              <td class="text-danger">{{ a.saldoAtual | number:'1.0-3' }} {{ a.unidadePadrao }}</td>
              <td>{{ a.estoqueMinimo | number:'1.0-3' }} {{ a.unidadePadrao }}</td>
              <td class="text-danger"><strong>-{{ (a.estoqueMinimo - a.saldoAtual) | number:'1.0-3' }}</strong></td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="4" class="text-center text-success">✓ Nenhum ingrediente abaixo do mínimo</td></tr>
          </ng-template>
        </p-table>
      </p-tabPanel>
    </p-tabView>

    <p-dialog [(visible)]="dialogVisible" header="Registrar Saída Manual" [modal]="true" [style]="{width: '500px'}">
      <form [formGroup]="form" (ngSubmit)="salvarSaida()" class="form-grid">
        <div class="field">
          <label>Ingrediente *</label>
          <p-dropdown formControlName="ingredienteId" [options]="saldos()" optionLabel="nome"
                      optionValue="ingredienteId" placeholder="Selecione" [style]="{width: '100%'}" [filter]="true"></p-dropdown>
        </div>
        <div class="row">
          <div class="field flex-1">
            <label>Quantidade *</label>
            <p-inputNumber formControlName="quantidade" [min]="0.001" [minFractionDigits]="0" [maxFractionDigits]="3"></p-inputNumber>
          </div>
          <div class="field flex-1">
            <label>Motivo *</label>
            <p-dropdown formControlName="motivo" [options]="motivos" optionLabel="label" optionValue="value" [style]="{width: '100%'}"></p-dropdown>
          </div>
        </div>
        <div class="field">
          <label>Observações</label>
          <textarea pInputTextarea formControlName="observacoes" rows="3"></textarea>
        </div>
        <div class="dialog-footer">
          <button pButton type="button" label="Cancelar" class="p-button-text" (click)="dialogVisible = false"></button>
          <button pButton type="submit" label="Registrar Saída" [loading]="salvando()" [disabled]="form.invalid"></button>
        </div>
      </form>
    </p-dialog>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .row-alerta { background-color: #fef2f2 !important; }
    .text-center { text-align: center; padding: 24px; color: var(--text-secondary); }
    .text-danger { color: var(--danger); }
    .text-success { color: var(--success); }
    .form-grid { display: flex; flex-direction: column; gap: 16px; }
    .row { display: flex; gap: 16px; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-weight: 500; font-size: 0.875rem; }
    .flex-1 { flex: 1; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  `]
})
export class EstoqueComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);
  private message = inject(MessageService);

  saldos = signal<any[]>([]);
  alertas = signal<any[]>([]);
  loading = signal(false);
  dialogVisible = false;
  salvando = signal(false);

  motivos = [
    { label: 'Desperdício', value: 'DESPERDICIO' },
    { label: 'Vencimento', value: 'VENCIMENTO' },
    { label: 'Quebra', value: 'QUEBRA' },
    { label: 'Uso interno', value: 'USO_INTERNO' }
  ];

  form = this.fb.group({
    ingredienteId: [null as number | null, Validators.required],
    quantidade: [0, [Validators.required, Validators.min(0.001)]],
    motivo: ['DESPERDICIO', Validators.required],
    observacoes: ['']
  });

  ngOnInit() { this.carregar(); }

  carregar() {
    this.loading.set(true);
    this.adminService.saldoEstoque().subscribe({
      next: s => { this.saldos.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
    this.adminService.alertasEstoque().subscribe(a => this.alertas.set(a));
  }

  abrirSaida() {
    this.form.reset({ motivo: 'DESPERDICIO', quantidade: 0 });
    this.dialogVisible = true;
  }

  salvarSaida() {
    if (this.form.invalid) return;
    this.salvando.set(true);
    this.adminService.registrarSaidaEstoque(this.form.value as any).subscribe({
      next: () => {
        this.message.add({ severity: 'success', summary: 'Registrado', detail: 'Saída registrada' });
        this.dialogVisible = false;
        this.salvando.set(false);
        this.carregar();
      },
      error: () => this.salvando.set(false)
    });
  }
}
