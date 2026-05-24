import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AdminService } from '@core/services/admin.service';
import { PedidoResponse, StatusPedido } from '@core/models/models';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, ButtonModule, CardModule, TagModule,
    DialogModule, InputTextareaModule
  ],
  template: `
    <div class="page-header">
      <h1>Pedidos da Cozinha</h1>
      <button pButton icon="pi pi-refresh" label="Atualizar" class="p-button-outlined" (click)="carregar()"></button>
    </div>

    <div class="kanban">
      <div class="coluna" *ngFor="let col of colunas">
        <div class="coluna-header" [style.borderTopColor]="col.cor">
          <h3>{{ col.titulo }}</h3>
          <span class="badge">{{ pedidosPorStatus(col.status).length }}</span>
        </div>
        <div class="coluna-body">
          <div *ngFor="let p of pedidosPorStatus(col.status)" class="pedido-card" (click)="abrirDetalhe(p)">
            <div class="pedido-header">
              <strong>#{{ p.id }}</strong>
              <small>{{ p.createdAt | date:'HH:mm' }}</small>
            </div>
            <div class="pedido-cliente">{{ p.clienteNome }}</div>
            <div class="pedido-itens">
              <div *ngFor="let it of p.itens">{{ it.quantidade }}x {{ it.pratoNome }}</div>
            </div>
            <div class="pedido-footer">
              <strong>{{ p.valorTotal | currency:'BRL' }}</strong>
            </div>
            <div class="pedido-acoes">
              <button pButton *ngIf="col.proximoStatus" [label]="col.botao || ''" class="p-button-sm" (click)="avancar(p, col.proximoStatus, $event)"></button>
              <button pButton *ngIf="podecancelar(p.status)" icon="pi pi-times" class="p-button-sm p-button-danger p-button-outlined" (click)="abrirCancelar(p, $event)"></button>
            </div>
          </div>
          <div *ngIf="pedidosPorStatus(col.status).length === 0" class="empty">Vazio</div>
        </div>
      </div>
    </div>

    <p-dialog [(visible)]="cancelarDialog" header="Cancelar Pedido" [modal]="true" [style]="{width: '500px'}">
      <p *ngIf="pedidoSelecionado">Cancelar pedido <strong>#{{ pedidoSelecionado.id }}</strong>?</p>
      <div class="field" style="margin-top: 16px;">
        <label>Motivo *</label>
        <textarea pInputTextarea [(ngModel)]="motivoCancelamento" rows="3"></textarea>
      </div>
      <div class="dialog-footer">
        <button pButton label="Voltar" class="p-button-text" (click)="cancelarDialog = false"></button>
        <button pButton label="Cancelar Pedido" class="p-button-danger" [disabled]="!motivoCancelamento" (click)="confirmarCancelamento()"></button>
      </div>
    </p-dialog>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; font-size: 1.5rem; }
    .kanban { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
    .coluna { background: #f8fafc; border-radius: 8px; padding: 12px; min-height: 600px; }
    .coluna-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-top: 3px solid; padding-top: 12px; margin-bottom: 12px; }
    .coluna-header h3 { margin: 0; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; }
    .badge { background: #fff; padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
    .coluna-body { display: flex; flex-direction: column; gap: 12px; }
    .pedido-card { background: #fff; padding: 12px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); cursor: pointer; transition: transform 0.15s; }
    .pedido-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .pedido-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .pedido-header small { color: var(--text-secondary); }
    .pedido-cliente { font-size: 0.875rem; margin-bottom: 8px; }
    .pedido-itens { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 8px; }
    .pedido-itens div { line-height: 1.4; }
    .pedido-footer { padding-top: 8px; border-top: 1px solid #e2e8f0; margin-bottom: 8px; }
    .pedido-acoes { display: flex; gap: 6px; }
    .pedido-acoes button { flex: 1; }
    .empty { text-align: center; color: var(--text-secondary); font-size: 0.875rem; padding: 24px 0; }
    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label { font-weight: 500; font-size: 0.875rem; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
  `]
})
export class PedidosComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private confirmation = inject(ConfirmationService);
  private message = inject(MessageService);

  pedidos = signal<PedidoResponse[]>([]);
  cancelarDialog = false;
  pedidoSelecionado: PedidoResponse | null = null;
  motivoCancelamento = '';

  private pollInterval: any;

  colunas: Array<{ status: StatusPedido; titulo: string; cor: string; proximoStatus?: StatusPedido; botao?: string }> = [
    { status: 'RECEBIDO', titulo: 'Recebidos', cor: '#3b82f6', proximoStatus: 'CONFIRMADO', botao: 'Confirmar' },
    { status: 'CONFIRMADO', titulo: 'Confirmados', cor: '#8b5cf6', proximoStatus: 'EM_PREPARO', botao: 'Iniciar preparo' },
    { status: 'EM_PREPARO', titulo: 'Em preparo', cor: '#f59e0b', proximoStatus: 'PRONTO', botao: 'Marcar pronto' },
    { status: 'PRONTO', titulo: 'Prontos', cor: '#10b981', proximoStatus: 'SAIU_ENTREGA', botao: 'Saiu p/ entrega' },
    { status: 'SAIU_ENTREGA', titulo: 'Em entrega', cor: '#06b6d4', proximoStatus: 'FINALIZADO', botao: 'Finalizar' }
  ];

  ngOnInit() {
    this.carregar();
    this.pollInterval = setInterval(() => this.carregar(), 30000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  carregar() {
    this.adminService.listarPedidos({ size: 100 }).subscribe(p => this.pedidos.set(p.content));
  }

  pedidosPorStatus(status: StatusPedido): PedidoResponse[] {
    return this.pedidos().filter(p => p.status === status);
  }

  podecancelar(status: StatusPedido): boolean {
    return ['RECEBIDO', 'CONFIRMADO', 'EM_PREPARO'].includes(status);
  }

  avancar(p: PedidoResponse, novoStatus: StatusPedido, event: Event) {
    event.stopPropagation();
    this.adminService.alterarStatusPedido(p.id, novoStatus).subscribe({
      next: () => {
        this.message.add({ severity: 'success', summary: 'Status atualizado', detail: `Pedido #${p.id} → ${novoStatus}` });
        this.carregar();
      }
    });
  }

  abrirCancelar(p: PedidoResponse, event: Event) {
    event.stopPropagation();
    this.pedidoSelecionado = p;
    this.motivoCancelamento = '';
    this.cancelarDialog = true;
  }

  confirmarCancelamento() {
    if (!this.pedidoSelecionado || !this.motivoCancelamento) return;
    this.adminService.cancelarPedido(this.pedidoSelecionado.id, this.motivoCancelamento).subscribe(() => {
      this.message.add({ severity: 'success', summary: 'Cancelado', detail: 'Pedido cancelado, estoque estornado' });
      this.cancelarDialog = false;
      this.carregar();
    });
  }

  abrirDetalhe(p: PedidoResponse) {
    // Pode abrir um dialog com detalhes completos
  }
}
