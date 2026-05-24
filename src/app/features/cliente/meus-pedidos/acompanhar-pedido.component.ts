import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { interval, Subscription } from 'rxjs';
import { PedidoService } from '../../../core/services/pedido.service';
import { Pedido, StatusPedido } from '../../../core/models/models';

interface StepItem {
  status: StatusPedido;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-acompanhar-pedido',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, CurrencyPipe, DatePipe],
  template: `
    <div class="page-container">
      <button
        pButton
        icon="pi pi-arrow-left"
        label="Voltar"
        class="p-button-text mb-3"
        (click)="voltar()"
      ></button>

      @if (loading()) {
        <div class="loading">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
      }

      @if (pedido(); as p) {
        <div class="acompanhar-grid">
          <!-- Timeline -->
          <div class="card timeline-card">
            <h2>Status do Pedido #{{ p.id }}</h2>

            @if (p.status === 'CANCELADO') {
              <div class="cancelado">
                <i class="pi pi-times-circle"></i>
                <h3>Pedido Cancelado</h3>
                @if (p.motivoCancelamento) {
                  <p>{{ p.motivoCancelamento }}</p>
                }
              </div>
            } @else {
              <div class="timeline">
                @for (step of steps; track step.status; let i = $index) {
                  <div class="step" [class.completo]="isCompleto(step.status, p.status)" [class.ativo]="step.status === p.status">
                    <div class="step-icon">
                      @if (isCompleto(step.status, p.status) && step.status !== p.status) {
                        <i class="pi pi-check"></i>
                      } @else {
                        <i [class]="step.icon"></i>
                      }
                    </div>
                    <div class="step-label">{{ step.label }}</div>
                    @if (i < steps.length - 1) {
                      <div class="step-line" [class.preenchido]="isCompleto(steps[i+1].status, p.status)"></div>
                    }
                  </div>
                }
              </div>

              <div class="status-atual">
                <i class="pi pi-info-circle"></i>
                <span>{{ getMensagem(p.status) }}</span>
              </div>
            }
          </div>

          <!-- Detalhes -->
          <div class="card detalhes">
            <h2>Detalhes do Pedido</h2>

            <div class="info-row">
              <span class="label">Data:</span>
              <span>{{ p.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>

            <div class="info-row">
              <span class="label">Endereço:</span>
              <span>{{ p.enderecoEntrega || '-' }}</span>
            </div>

            @if (p.observacoes) {
              <div class="info-row">
                <span class="label">Observações:</span>
                <span>{{ p.observacoes }}</span>
              </div>
            }

            <h3 class="itens-titulo">Itens</h3>
            <div class="itens">
              @for (item of p.itens; track $index) {
                <div class="item">
                  <span class="qty">{{ item.quantidade }}x</span>
                  <div class="item-nome">
                    <strong>{{ item.pratoNome }}</strong>
                    @if (item.observacoes) {
                      <small>{{ item.observacoes }}</small>
                    }
                  </div>
                  <span class="item-preco">
                    {{ (item.precoUnitario ?? 0) * item.quantidade | currency:'BRL' }}
                  </span>
                </div>
              }
            </div>

            <div class="total-row">
              <span>Total</span>
              <span class="total-valor">{{ p.valorTotal | currency:'BRL' }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .mb-3 { margin-bottom: 1rem; }

    .loading {
      text-align: center;
      padding: 3rem;
    }

    .loading i { font-size: 3rem; color: var(--primary-color); }

    .acompanhar-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .card h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 1.5rem;
    }

    /* Timeline */
    .timeline {
      display: flex;
      justify-content: space-between;
      position: relative;
      margin-bottom: 2rem;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      position: relative;
      z-index: 2;
    }

    .step-icon {
      width: 48px;
      height: 48px;
      background: white;
      border: 3px solid var(--gray-300);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-400);
      font-size: 1.125rem;
      transition: all 0.3s;
    }

    .step.completo .step-icon {
      background: var(--success-color);
      border-color: var(--success-color);
      color: white;
    }

    .step.ativo .step-icon {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5); }
      50% { box-shadow: 0 0 0 12px rgba(37, 99, 235, 0); }
    }

    .step-label {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: var(--gray-600);
      text-align: center;
      font-weight: 500;
    }

    .step.ativo .step-label,
    .step.completo .step-label {
      color: var(--gray-900);
      font-weight: 600;
    }

    .step-line {
      position: absolute;
      top: 24px;
      left: 50%;
      width: 100%;
      height: 3px;
      background: var(--gray-300);
      z-index: -1;
    }

    .step-line.preenchido {
      background: var(--success-color);
    }

    .status-atual {
      background: var(--primary-color-light);
      color: var(--primary-color-dark);
      padding: 1rem;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }

    .cancelado {
      text-align: center;
      padding: 2rem;
      background: #fef2f2;
      border-radius: 12px;
      color: var(--danger-color);
    }

    .cancelado i {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }

    .cancelado h3 {
      color: #991b1b;
      margin-bottom: 0.25rem;
    }

    .cancelado p {
      color: #991b1b;
      font-size: 0.875rem;
    }

    /* Detalhes */
    .info-row {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem 0;
      font-size: 0.875rem;
    }

    .label {
      font-weight: 600;
      color: var(--gray-700);
      min-width: 100px;
    }

    .itens-titulo {
      margin-top: 1.5rem;
      margin-bottom: 0.75rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--gray-900);
    }

    .item {
      display: grid;
      grid-template-columns: 40px 1fr auto;
      gap: 0.5rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--gray-100);
      align-items: center;
    }

    .qty {
      font-weight: 700;
      color: var(--primary-color);
    }

    .item-nome small {
      display: block;
      color: var(--gray-500);
      font-size: 0.75rem;
    }

    .item-preco {
      font-weight: 600;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      margin-top: 0.5rem;
      border-top: 2px solid var(--gray-200);
      font-weight: 700;
      font-size: 1.125rem;
    }

    .total-valor {
      color: var(--gray-900);
      font-size: 1.5rem;
    }

    @media (max-width: 968px) {
      .acompanhar-grid {
        grid-template-columns: 1fr;
      }

      .step-label {
        font-size: 0.625rem;
      }
    }
  `]
})
export class AcompanharPedidoComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pedidoService = inject(PedidoService);

  pedido = signal<Pedido | null>(null);
  loading = signal(false);
  private pollingSub?: Subscription;

  steps: StepItem[] = [
    { status: 'RECEBIDO', label: 'Recebido', icon: 'pi pi-inbox' },
    { status: 'CONFIRMADO', label: 'Confirmado', icon: 'pi pi-check-circle' },
    { status: 'EM_PREPARO', label: 'Em preparo', icon: 'pi pi-stopwatch' },
    { status: 'PRONTO', label: 'Pronto', icon: 'pi pi-flag' },
    { status: 'SAIU_ENTREGA', label: 'A caminho', icon: 'pi pi-send' },
    { status: 'FINALIZADO', label: 'Entregue', icon: 'pi pi-check' }
  ];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.carregar(id);
      // Polling de status a cada 15 segundos
      this.pollingSub = interval(15000).subscribe(() => this.atualizarStatus(id));
    }
  }

  ngOnDestroy() {
    this.pollingSub?.unsubscribe();
  }

  carregar(id: number) {
    this.loading.set(true);
    this.pedidoService.meusPedidos().subscribe({
      next: (pedidos) => {
        const p = pedidos.find(x => x.id === id);
        if (p) this.pedido.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  atualizarStatus(id: number) {
    this.pedidoService.status(id).subscribe({
      next: (res) => {
        const p = this.pedido();
        if (p && p.status !== res.status) {
          this.pedido.set({ ...p, status: res.status });
        }
      }
    });
  }

  isCompleto(stepStatus: StatusPedido, pedidoStatus: StatusPedido): boolean {
    const ordem: StatusPedido[] = [
      'RECEBIDO', 'CONFIRMADO', 'EM_PREPARO', 'PRONTO', 'SAIU_ENTREGA', 'FINALIZADO'
    ];
    const stepIndex = ordem.indexOf(stepStatus);
    const pedidoIndex = ordem.indexOf(pedidoStatus);
    return stepIndex <= pedidoIndex;
  }

  getMensagem(status: StatusPedido): string {
    const map: Record<StatusPedido, string> = {
      RECEBIDO: 'Seu pedido foi recebido e está aguardando confirmação',
      CONFIRMADO: 'Pedido confirmado! Em breve será preparado',
      EM_PREPARO: 'Seu pedido está sendo preparado com carinho',
      PRONTO: 'Pedido pronto! Aguardando entregador',
      SAIU_ENTREGA: 'A caminho do seu endereço',
      FINALIZADO: 'Pedido entregue. Bom apetite!',
      CANCELADO: 'Pedido cancelado'
    };
    return map[status] ?? '';
  }

  voltar() {
    this.router.navigate(['/meus-pedidos']);
  }
}
