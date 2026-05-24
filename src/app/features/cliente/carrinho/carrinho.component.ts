import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { CarrinhoService } from '../../../core/services/carrinho.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputNumberModule, CurrencyPipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Meu Carrinho</h1>
        <button
          pButton
          icon="pi pi-arrow-left"
          label="Continuar comprando"
          class="p-button-text"
          (click)="continuar()"
        ></button>
      </div>

      @if (carrinho.isEmpty()) {
        <div class="empty-cart">
          <i class="pi pi-shopping-cart"></i>
          <h2>Seu carrinho está vazio</h2>
          <p>Adicione pratos do cardápio para começar</p>
          <button
            pButton
            label="Ver cardápio"
            icon="pi pi-arrow-right"
            iconPos="right"
            (click)="continuar()"
          ></button>
        </div>
      } @else {
        <div class="cart-grid">
          <div class="cart-items">
            @for (item of carrinho.itens(); track item.prato.id) {
              <div class="cart-item">
                <div class="item-imagem">
                  @if (item.prato.fotoUrl) {
                    <img [src]="item.prato.fotoUrl" [alt]="item.prato.nome" />
                  } @else {
                    <i class="pi pi-image"></i>
                  }
                </div>

                <div class="item-info">
                  <h3>{{ item.prato.nome }}</h3>
                  <p class="categoria">{{ item.prato.categoria.nome }}</p>
                  @if (item.observacoes) {
                    <p class="obs">
                      <i class="pi pi-info-circle"></i>
                      {{ item.observacoes }}
                    </p>
                  }
                  <span class="preco-unitario">{{ item.prato.precoVenda | currency:'BRL' }} cada</span>
                </div>

                <div class="item-controls">
                  <p-inputNumber
                    [ngModel]="item.quantidade"
                    (ngModelChange)="alterarQuantidade(item.prato.id, $event)"
                    [showButtons]="true"
                    [min]="1"
                    [max]="20"
                    buttonLayout="horizontal"
                    decrementButtonClass="p-button-outlined p-button-sm"
                    incrementButtonClass="p-button-outlined p-button-sm"
                    incrementButtonIcon="pi pi-plus"
                    decrementButtonIcon="pi pi-minus"
                    inputStyleClass="input-qty"
                  ></p-inputNumber>

                  <div class="item-subtotal">
                    {{ item.prato.precoVenda * item.quantidade | currency:'BRL' }}
                  </div>

                  <button
                    pButton
                    icon="pi pi-trash"
                    class="p-button-text p-button-danger p-button-sm"
                    (click)="remover(item.prato.id)"
                  ></button>
                </div>
              </div>
            }
          </div>

          <div class="cart-summary">
            <h2>Resumo</h2>
            <div class="summary-row">
              <span>Subtotal ({{ carrinho.quantidadeTotal() }} {{ carrinho.quantidadeTotal() === 1 ? 'item' : 'itens' }})</span>
              <span>{{ carrinho.valorTotal() | currency:'BRL' }}</span>
            </div>
            <div class="summary-row">
              <span>Taxa de entrega</span>
              <span class="text-success">Grátis</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-total">
              <span>Total</span>
              <span>{{ carrinho.valorTotal() | currency:'BRL' }}</span>
            </div>

            <button
              pButton
              label="Finalizar Pedido"
              icon="pi pi-check"
              iconPos="right"
              class="w-full btn-checkout"
              (click)="finalizar()"
            ></button>

            <button
              pButton
              label="Limpar carrinho"
              icon="pi pi-trash"
              class="p-button-text p-button-danger w-full mt-2"
              (click)="limpar()"
            ></button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .empty-cart {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
    }

    .empty-cart i {
      font-size: 4rem;
      color: var(--gray-300);
      margin-bottom: 1rem;
    }

    .empty-cart h2 {
      font-size: 1.5rem;
      color: var(--gray-700);
      margin-bottom: 0.5rem;
    }

    .empty-cart p {
      color: var(--gray-500);
      margin-bottom: 1.5rem;
    }

    .cart-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 1.5rem;
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .cart-item {
      background: white;
      border-radius: 12px;
      padding: 1rem;
      display: grid;
      grid-template-columns: 80px 1fr auto;
      gap: 1rem;
      align-items: center;
      border: 1px solid var(--gray-200);
    }

    .item-imagem {
      width: 80px;
      height: 80px;
      background: var(--gray-100);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .item-imagem img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item-imagem i {
      font-size: 2rem;
      color: var(--gray-400);
    }

    .item-info h3 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 0.25rem;
    }

    .categoria {
      font-size: 0.75rem;
      color: var(--primary-color);
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }

    .obs {
      font-size: 0.8125rem;
      color: var(--gray-500);
      font-style: italic;
      margin-bottom: 0.25rem;
    }

    .obs i {
      margin-right: 0.25rem;
    }

    .preco-unitario {
      font-size: 0.875rem;
      color: var(--gray-600);
    }

    .item-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    :host ::ng-deep .input-qty {
      width: 50px !important;
      text-align: center;
    }

    .item-subtotal {
      font-weight: 700;
      color: var(--gray-900);
      min-width: 80px;
      text-align: right;
    }

    /* Summary */
    .cart-summary {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      height: fit-content;
      position: sticky;
      top: 80px;
      border: 1px solid var(--gray-200);
    }

    .cart-summary h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: var(--gray-900);
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      color: var(--gray-700);
      font-size: 0.9375rem;
    }

    .text-success {
      color: var(--success-color);
      font-weight: 600;
    }

    .summary-divider {
      height: 1px;
      background: var(--gray-200);
      margin: 0.75rem 0;
    }

    .summary-total {
      display: flex;
      justify-content: space-between;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 1.5rem;
    }

    .btn-checkout {
      padding: 0.875rem !important;
      font-size: 1rem !important;
    }

    .w-full { width: 100%; }
    .mt-2 { margin-top: 0.5rem; }

    @media (max-width: 968px) {
      .cart-grid {
        grid-template-columns: 1fr;
      }

      .cart-summary {
        position: static;
      }

      .cart-item {
        grid-template-columns: 60px 1fr;
      }

      .item-imagem {
        width: 60px;
        height: 60px;
      }

      .item-controls {
        grid-column: 1 / -1;
        justify-content: space-between;
        padding-top: 0.75rem;
        border-top: 1px solid var(--gray-100);
      }
    }
  `]
})
export class CarrinhoComponent {
  carrinho = inject(CarrinhoService);
  private auth = inject(AuthService);
  private router = inject(Router);

  continuar() {
    this.router.navigate(['/cardapio']);
  }

  alterarQuantidade(pratoId: number, quantidade: number) {
    this.carrinho.alterarQuantidade(pratoId, quantidade);
  }

  remover(pratoId: number) {
    this.carrinho.remover(pratoId);
  }

  limpar() {
    this.carrinho.limpar();
  }

  finalizar() {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
