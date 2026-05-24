import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { PedidoService } from '../../../core/services/pedido.service';
import { Pedido, StatusPedido } from '../../../core/models/models';

@Component({
  selector: 'app-meus-pedidos',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, CurrencyPipe, DatePipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Meus Pedidos</h1>
        <button
          pButton
          icon="pi pi-refresh"
          class="p-button-text"
          (click)="carregar()"
        ></button>
      </div>

      @if (loading()) {
        <div class="loading">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
      }

      @if (!loading() && pedidos().length === 0) {
        <div class="empty">
          <i class="pi pi-inbox"></i>
          <h3>Você ainda não fez pedidos</h3>
          <p>Visite o cardápio para fazer seu primeiro pedido</p>
          <button pButton label="Ir ao cardápio" (click)="irAoCardapio()"></button>
        </div>
      }

      @if (!loading() && pedidos().length > 0) {
        <div class="pedidos-list">
          @for (pedido of pedidos(); track pedido.id) {
            <div class="pedido-card" (click)="verDetalhe(pedido.id)">
              <div class="pedido-header">
                <div>
                  <span class="pedido-id">Pedido #{{ pedido.id }}</span>
                  <span class="pedido-data">{{ pedido.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <p-tag
                  [value]="getStatusLabel(pedido.status)"
                  [severity]="getStatusSeverity(pedido.status)"
                ></p-tag>
              </div>

              <div class="pedido-body">
                <div class="itens-resumo">
                  @for (item of pedido.itens.slice(0, 3); track $index) {
                    <span class="item-tag">
                      {{ item.quantidade }}x {{ item.pratoNome }}
                    </span>
                  }
                  @if (pedido.itens.length > 3) {
                    <span class="mais">+{{ pedido.itens.length - 3 }} itens</span>
                  }
                </div>

                <div class="pedido-footer">
                  <span class="total">{{ pedido.valorTotal | currency:'BRL' }}</span>
                  <button
                    pButton
                    label="Acompanhar"
                    icon="pi pi-eye"
                    class="p-button-sm p-button-text"
                  ></button>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .loading {
      text-align: center;
      padding: 3rem;
    }

    .loading i {
      font-size: 3rem;
      color: var(--primary-color);
    }

    .empty {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
    }

    .empty i {
      font-size: 4rem;
      color: var(--gray-300);
      margin-bottom: 1rem;
    }

    .empty h3 {
      color: var(--gray-700);
      margin-bottom: 0.5rem;
    }

    .empty p {
      color: var(--gray-500);
      margin-bottom: 1.5rem;
    }

    .pedidos-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .pedido-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      cursor: pointer;
      transition: all 0.15s;
      border: 1px solid var(--gray-200);
    }

    .pedido-card:hover {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-md);
    }

    .pedido-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--gray-100);
      margin-bottom: 1rem;
    }

    .pedido-id {
      font-weight: 700;
      color: var(--gray-900);
      margin-right: 0.75rem;
    }

    .pedido-data {
      color: var(--gray-500);
      font-size: 0.875rem;
    }

    .itens-resumo {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .item-tag {
      background: var(--gray-100);
      padding: 0.25rem 0.625rem;
      border-radius: 6px;
      font-size: 0.8125rem;
      color: var(--gray-700);
    }

    .mais {
      color: var(--primary-color);
      font-size: 0.8125rem;
      font-weight: 600;
      align-self: center;
    }

    .pedido-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .total {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--gray-900);
    }
  `]
})
export class MeusPedidosComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private router = inject(Router);

  pedidos = signal<Pedido[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.loading.set(true);
    this.pedidoService.meusPedidos().subscribe({
      next: (pedidos) => {
        this.pedidos.set(pedidos);
        this.loading.set(false);
      },
      error: () => {
        this.pedidos.set([]);
        this.loading.set(false);
      }
    });
  }

  verDetalhe(id: number) {
    this.router.navigate(['/pedido', id]);
  }

  irAoCardapio() {
    this.router.navigate(['/cardapio']);
  }

  getStatusLabel(status: StatusPedido): string {
    const map: Record<StatusPedido, string> = {
      RECEBIDO: 'Recebido',
      CONFIRMADO: 'Confirmado',
      EM_PREPARO: 'Em preparo',
      PRONTO: 'Pronto',
      SAIU_ENTREGA: 'Saiu para entrega',
      FINALIZADO: 'Entregue',
      CANCELADO: 'Cancelado'
    };
    return map[status] ?? status;
  }

  getStatusSeverity(status: StatusPedido): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    const map: Record<StatusPedido, 'success' | 'info' | 'warning' | 'danger' | 'secondary'> = {
      RECEBIDO: 'info',
      CONFIRMADO: 'info',
      EM_PREPARO: 'warning',
      PRONTO: 'warning',
      SAIU_ENTREGA: 'warning',
      FINALIZADO: 'success',
      CANCELADO: 'danger'
    };
    return map[status] ?? 'secondary';
  }
}
