import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { DashboardResumo, TopPrato, SaldoEstoque } from '../../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ChartModule, CardModule, ButtonModule, CurrencyPipe],
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1 class="page-title">Dashboard</h1>
        <button
          pButton
          icon="pi pi-refresh"
          label="Atualizar"
          class="p-button-text"
          (click)="carregar()"
        ></button>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-primary">
          <div class="kpi-icon">
            <i class="pi pi-dollar"></i>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Faturamento hoje</span>
            <span class="kpi-value">{{ resumo()?.faturamentoHoje ?? 0 | currency:'BRL' }}</span>
          </div>
        </div>

        <div class="kpi-card kpi-info">
          <div class="kpi-icon">
            <i class="pi pi-shopping-cart"></i>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Pedidos hoje</span>
            <span class="kpi-value">{{ resumo()?.pedidosHoje ?? 0 }}</span>
          </div>
        </div>

        <div class="kpi-card kpi-success">
          <div class="kpi-icon">
            <i class="pi pi-chart-line"></i>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Ticket médio</span>
            <span class="kpi-value">{{ resumo()?.ticketMedio ?? 0 | currency:'BRL' }}</span>
          </div>
        </div>

        <div class="kpi-card kpi-warning">
          <div class="kpi-icon">
            <i class="pi pi-percentage"></i>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Food cost médio</span>
            <span class="kpi-value">{{ (resumo()?.foodCostMedio ?? 0).toFixed(1) }}%</span>
          </div>
        </div>

        <div class="kpi-card kpi-danger" (click)="irParaEstoque()" style="cursor:pointer">
          <div class="kpi-icon">
            <i class="pi pi-exclamation-triangle"></i>
          </div>
          <div class="kpi-info">
            <span class="kpi-label">Alertas estoque</span>
            <span class="kpi-value">{{ resumo()?.alertasEstoque ?? 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Charts -->
      <div class="charts-grid">
        <div class="card chart-card">
          <h3>Top 5 pratos mais vendidos</h3>
          @if (topPratos().length > 0) {
            <p-chart type="bar" [data]="topPratosData" [options]="chartOptions"></p-chart>
          } @else {
            <div class="empty-chart">
              <i class="pi pi-chart-bar"></i>
              <p>Sem dados de vendas</p>
            </div>
          }
        </div>

        <div class="card alertas-card">
          <h3>
            <i class="pi pi-exclamation-triangle text-warning"></i>
            Ingredientes em baixa
          </h3>
          @if (alertas().length === 0) {
            <div class="empty-alertas">
              <i class="pi pi-check-circle"></i>
              <p>Estoque OK</p>
            </div>
          } @else {
            <div class="alertas-list">
              @for (alerta of alertas(); track alerta.ingredienteId) {
                <div class="alerta-item">
                  <div>
                    <strong>{{ alerta.nome }}</strong>
                    <small>{{ alerta.sku }}</small>
                  </div>
                  <div class="alerta-saldo">
                    <span class="saldo-atual">{{ alerta.saldo }}</span>
                    <span class="saldo-min">/ mín {{ alerta.estoqueMinimo }} {{ alerta.unidadePadrao }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .kpi-card {
      background: white;
      border-radius: 12px;
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid var(--gray-200);
      transition: all 0.15s;
    }

    .kpi-card:hover {
      box-shadow: var(--shadow-md);
    }

    .kpi-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .kpi-primary .kpi-icon {
      background: var(--primary-color-light);
      color: var(--primary-color);
    }

    .kpi-info .kpi-icon {
      background: #dbeafe;
      color: #1e40af;
    }

    .kpi-success .kpi-icon {
      background: #d1fae5;
      color: #065f46;
    }

    .kpi-warning .kpi-icon {
      background: #fef3c7;
      color: #92400e;
    }

    .kpi-danger .kpi-icon {
      background: #fee2e2;
      color: #991b1b;
    }

    .kpi-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .kpi-label {
      font-size: 0.75rem;
      color: var(--gray-500);
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    .kpi-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--gray-900);
    }

    /* Charts */
    .charts-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
    }

    .card h3 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .text-warning {
      color: var(--warning-color);
    }

    .empty-chart, .empty-alertas {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--gray-400);
    }

    .empty-chart i, .empty-alertas i {
      font-size: 3rem;
      margin-bottom: 0.5rem;
      display: block;
    }

    .empty-alertas i {
      color: var(--success-color);
    }

    .alertas-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 350px;
      overflow-y: auto;
    }

    .alerta-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: #fef2f2;
      border-radius: 8px;
      border-left: 3px solid var(--danger-color);
    }

    .alerta-item strong {
      display: block;
      color: var(--gray-900);
      font-size: 0.875rem;
    }

    .alerta-item small {
      color: var(--gray-500);
      font-size: 0.75rem;
    }

    .alerta-saldo {
      text-align: right;
    }

    .saldo-atual {
      color: var(--danger-color);
      font-weight: 700;
      font-size: 1.125rem;
    }

    .saldo-min {
      color: var(--gray-500);
      font-size: 0.75rem;
      margin-left: 0.25rem;
    }

    @media (max-width: 968px) {
      .charts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);

  resumo = signal<DashboardResumo | null>(null);
  topPratos = signal<TopPrato[]>([]);
  alertas = signal<SaldoEstoque[]>([]);

  topPratosData: any = {};
  chartOptions: any = {};

  ngOnInit() {
    this.carregar();
    this.setupChartOptions();
  }

  carregar() {
    this.adminService.dashboardResumo().subscribe({
      next: (r) => this.resumo.set(r),
      error: () => this.resumo.set(null)
    });

    this.adminService.topPratos().subscribe({
      next: (pratos) => {
        this.topPratos.set(pratos);
        this.atualizarGraficoTop(pratos);
      },
      error: () => this.topPratos.set([])
    });

    this.adminService.alertasEstoque().subscribe({
      next: (a) => this.alertas.set(a),
      error: () => this.alertas.set([])
    });
  }

  atualizarGraficoTop(pratos: TopPrato[]) {
    this.topPratosData = {
      labels: pratos.map(p => p.pratoNome),
      datasets: [
        {
          label: 'Quantidade vendida',
          backgroundColor: '#2563eb',
          borderColor: '#1d4ed8',
          data: pratos.map(p => p.quantidadeVendida)
        }
      ]
    };
  }

  setupChartOptions() {
    this.chartOptions = {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 } }
      }
    };
  }

  irParaEstoque() {
    this.router.navigate(['/admin/estoque']);
  }
}
