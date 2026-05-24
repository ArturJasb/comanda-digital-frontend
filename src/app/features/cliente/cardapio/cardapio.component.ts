import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { CardapioService } from '../../../core/services/cardapio.service';
import { CarrinhoService } from '../../../core/services/carrinho.service';
import { Prato, Categoria } from '../../../core/models/models';

@Component({
  selector: 'app-cardapio',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TagModule, CurrencyPipe],
  template: `
    <div class="page-container">
      <div class="hero">
        <h1>Nosso Cardápio</h1>
        <p>Pratos preparados na hora, com ingredientes selecionados</p>
      </div>

      <!-- Filtros por categoria -->
      <div class="filters">
        <button
          pButton
          label="Todos"
          [class.p-button-outlined]="categoriaSelecionada() !== null"
          (click)="filtrarPorCategoria(null)"
          class="filter-btn"
        ></button>
        @for (cat of categorias(); track cat.id) {
          <button
            pButton
            [label]="cat.nome"
            [class.p-button-outlined]="categoriaSelecionada() !== cat.id"
            (click)="filtrarPorCategoria(cat.id)"
            class="filter-btn"
          ></button>
        }
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading">
          <i class="pi pi-spin pi-spinner"></i>
          <span>Carregando pratos...</span>
        </div>
      }

      <!-- Grid de pratos -->
      @if (!loading() && pratos().length > 0) {
        <div class="pratos-grid">
          @for (prato of pratos(); track prato.id) {
            <div class="prato-card" (click)="verDetalhe(prato.id)">
              <div class="prato-imagem">
                @if (prato.fotoUrl) {
                  <img [src]="prato.fotoUrl" [alt]="prato.nome" />
                } @else {
                  <div class="placeholder">
                    <i class="pi pi-image"></i>
                  </div>
                }
                @if (prato.tempoPreparoMin) {
                  <span class="tempo-preparo">
                    <i class="pi pi-clock"></i>
                    {{ prato.tempoPreparoMin }}min
                  </span>
                }
              </div>
              <div class="prato-info">
                <span class="prato-categoria">{{ prato.categoria.nome }}</span>
                <h3 class="prato-nome">{{ prato.nome }}</h3>
                <p class="prato-descricao">{{ prato.descricao }}</p>
                <div class="prato-footer">
                  <span class="prato-preco">{{ prato.precoVenda | currency:'BRL' }}</span>
                  <button
                    pButton
                    icon="pi pi-plus"
                    label="Adicionar"
                    class="p-button-sm"
                    (click)="adicionarAoCarrinho($event, prato)"
                  ></button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Vazio -->
      @if (!loading() && pratos().length === 0) {
        <div class="empty">
          <i class="pi pi-inbox"></i>
          <h3>Nenhum prato disponível</h3>
          <p>Tente outra categoria ou volte mais tarde</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .hero {
      text-align: center;
      padding: 2rem 0 1.5rem;
    }

    .hero h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .hero p {
      color: var(--gray-500);
    }

    .filters {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      justify-content: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--gray-200);
    }

    .filter-btn {
      font-size: 0.875rem;
    }

    .loading, .empty {
      text-align: center;
      padding: 3rem;
      color: var(--gray-500);
    }

    .loading i, .empty i {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: block;
    }

    .empty h3 {
      margin: 0.5rem 0;
      color: var(--gray-700);
    }

    .pratos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .prato-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
      border: 1px solid var(--gray-200);
      display: flex;
      flex-direction: column;
    }

    .prato-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary-color);
    }

    .prato-imagem {
      position: relative;
      height: 180px;
      background: var(--gray-100);
      overflow: hidden;
    }

    .prato-imagem img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--gray-400);
    }

    .placeholder i {
      font-size: 3rem;
    }

    .tempo-preparo {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .prato-info {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .prato-categoria {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }

    .prato-nome {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 0.5rem;
    }

    .prato-descricao {
      font-size: 0.875rem;
      color: var(--gray-500);
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }

    .prato-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }

    .prato-preco {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--gray-900);
    }
  `]
})
export class CardapioComponent implements OnInit {
  private cardapioService = inject(CardapioService);
  private carrinhoService = inject(CarrinhoService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  pratos = signal<Prato[]>([]);
  categorias = signal<Categoria[]>([]);
  loading = signal(false);
  categoriaSelecionada = signal<number | null>(null);

  ngOnInit() {
    this.carregarCategorias();
    this.carregarPratos();
  }

  carregarCategorias() {
    this.cardapioService.categorias().subscribe({
      next: (cats) => this.categorias.set(cats),
      error: () => this.categorias.set([])
    });
  }

  carregarPratos(categoriaId?: number) {
    this.loading.set(true);
    this.cardapioService.listar(categoriaId).subscribe({
      next: (pratos) => {
        this.pratos.set(pratos);
        this.loading.set(false);
      },
      error: () => {
        this.pratos.set([]);
        this.loading.set(false);
      }
    });
  }

  filtrarPorCategoria(categoriaId: number | null) {
    this.categoriaSelecionada.set(categoriaId);
    this.carregarPratos(categoriaId ?? undefined);
  }

  verDetalhe(id: number) {
    this.router.navigate(['/cardapio', id]);
  }

  adicionarAoCarrinho(event: Event, prato: Prato) {
    event.stopPropagation();
    this.carrinhoService.adicionar(prato);
    this.messageService.add({
      severity: 'success',
      summary: 'Adicionado!',
      detail: `${prato.nome} foi adicionado ao carrinho`,
      life: 2000
    });
  }
}
