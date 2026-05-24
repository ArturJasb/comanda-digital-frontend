import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageService } from 'primeng/api';
import { CardapioService } from '../../../core/services/cardapio.service';
import { CarrinhoService } from '../../../core/services/carrinho.service';
import { Prato } from '../../../core/models/models';

@Component({
  selector: 'app-prato-detalhe',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputNumberModule, InputTextareaModule, CurrencyPipe],
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

      @if (prato(); as p) {
        <div class="detalhe-grid">
          <div class="imagem-container">
            @if (p.fotoUrl) {
              <img [src]="p.fotoUrl" [alt]="p.nome" />
            } @else {
              <div class="placeholder">
                <i class="pi pi-image"></i>
              </div>
            }
          </div>

          <div class="info-container">
            <span class="categoria">{{ p.categoria.nome }}</span>
            <h1>{{ p.nome }}</h1>
            <p class="descricao">{{ p.descricao }}</p>

            @if (p.tempoPreparoMin) {
              <div class="meta">
                <i class="pi pi-clock"></i>
                <span>Tempo de preparo: {{ p.tempoPreparoMin }} minutos</span>
              </div>
            }

            <div class="preco">{{ p.precoVenda | currency:'BRL' }}</div>

            <div class="adicionar-section">
              <div class="quantidade-control">
                <label>Quantidade</label>
                <p-inputNumber
                  [(ngModel)]="quantidade"
                  [showButtons]="true"
                  [min]="1"
                  [max]="20"
                  buttonLayout="horizontal"
                  decrementButtonClass="p-button-outlined"
                  incrementButtonClass="p-button-outlined"
                  incrementButtonIcon="pi pi-plus"
                  decrementButtonIcon="pi pi-minus"
                ></p-inputNumber>
              </div>

              <div class="obs-control">
                <label>Observações (opcional)</label>
                <textarea
                  pInputTextarea
                  [(ngModel)]="observacoes"
                  rows="3"
                  placeholder="Ex: sem cebola, ponto da carne, etc."
                ></textarea>
              </div>

              <button
                pButton
                [label]="'Adicionar ao Carrinho • ' + (p.precoVenda * quantidade | currency:'BRL')"
                icon="pi pi-shopping-cart"
                class="w-full btn-add"
                (click)="adicionar()"
              ></button>
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
      color: var(--gray-500);
    }

    .loading i {
      font-size: 3rem;
    }

    .detalhe-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      max-width: 1100px;
      margin: 0 auto;
    }

    .imagem-container {
      border-radius: 12px;
      overflow: hidden;
      background: var(--gray-100);
      aspect-ratio: 1;
      box-shadow: var(--shadow-md);
    }

    .imagem-container img {
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
      font-size: 5rem;
    }

    .info-container {
      display: flex;
      flex-direction: column;
    }

    .categoria {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--primary-color);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
    }

    .info-container h1 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 1rem;
    }

    .descricao {
      color: var(--gray-600);
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--gray-500);
      margin-bottom: 1.5rem;
      font-size: 0.875rem;
    }

    .preco {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 2rem;
    }

    .adicionar-section {
      background: var(--gray-50);
      padding: 1.5rem;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .quantidade-control, .obs-control {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .quantidade-control label, .obs-control label {
      font-weight: 500;
      font-size: 0.875rem;
      color: var(--gray-700);
    }

    .btn-add {
      margin-top: 0.5rem;
      font-size: 1rem;
      padding: 0.875rem;
    }

    .w-full {
      width: 100%;
    }

    @media (max-width: 768px) {
      .detalhe-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PratoDetalheComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cardapioService = inject(CardapioService);
  private carrinhoService = inject(CarrinhoService);
  private messageService = inject(MessageService);

  prato = signal<Prato | null>(null);
  loading = signal(false);
  quantidade = 1;
  observacoes = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.carregar(id);
  }

  carregar(id: number) {
    this.loading.set(true);
    this.cardapioService.detalhe(id).subscribe({
      next: (p) => {
        this.prato.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/cardapio']);
      }
    });
  }

  adicionar() {
    const p = this.prato();
    if (!p) return;

    this.carrinhoService.adicionar(p, this.quantidade, this.observacoes || undefined);
    this.messageService.add({
      severity: 'success',
      summary: 'Adicionado!',
      detail: `${this.quantidade}x ${p.nome} no carrinho`
    });
    this.router.navigate(['/carrinho']);
  }

  voltar() {
    this.router.navigate(['/cardapio']);
  }
}
