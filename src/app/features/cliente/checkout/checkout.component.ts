import { Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MessageService } from 'primeng/api';
import { CarrinhoService } from '../../../core/services/carrinho.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { AuthService } from '../../../core/services/auth.service';
import { PedidoRequest } from '../../../core/models/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, InputTextareaModule, CurrencyPipe],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Finalizar Pedido</h1>
        <button
          pButton
          icon="pi pi-arrow-left"
          label="Voltar"
          class="p-button-text"
          (click)="voltar()"
        ></button>
      </div>

      @if (carrinho.isEmpty()) {
        <div class="empty">
          <p>Seu carrinho está vazio</p>
          <button pButton label="Ir ao cardápio" (click)="irAoCardapio()"></button>
        </div>
      } @else {
        <div class="checkout-grid">
          <div class="left-col">
            <!-- Endereço -->
            <div class="card">
              <h2><i class="pi pi-map-marker"></i> Endereço de Entrega</h2>
              <form [formGroup]="form">
                <div class="form-field">
                  <label>Endereço completo</label>
                  <input
                    pInputText
                    formControlName="enderecoEntrega"
                    placeholder="Rua, número, complemento, bairro, cidade"
                  />
                  @if (form.get('enderecoEntrega')?.touched && form.get('enderecoEntrega')?.invalid) {
                    <small class="error">Endereço é obrigatório</small>
                  }
                </div>

                <div class="form-field">
                  <label>Observações do pedido (opcional)</label>
                  <textarea
                    pInputTextarea
                    formControlName="observacoes"
                    rows="3"
                    placeholder="Ex: ponto de referência, instruções para entrega..."
                  ></textarea>
                </div>
              </form>
            </div>

            <!-- Pagamento -->
            <div class="card">
              <h2><i class="pi pi-credit-card"></i> Pagamento</h2>
              <div class="pagamento-info">
                <i class="pi pi-info-circle"></i>
                <span>Pagamento simulado para fins de demonstração. Em produção seria integrado com gateway real.</span>
              </div>
            </div>

            <!-- Itens -->
            <div class="card">
              <h2><i class="pi pi-list"></i> Itens do pedido</h2>
              @for (item of carrinho.itens(); track item.prato.id) {
                <div class="item-resumo">
                  <span class="qty">{{ item.quantidade }}x</span>
                  <div class="item-nome">
                    <strong>{{ item.prato.nome }}</strong>
                    @if (item.observacoes) {
                      <small>{{ item.observacoes }}</small>
                    }
                  </div>
                  <span class="item-preco">
                    {{ item.prato.precoVenda * item.quantidade | currency:'BRL' }}
                  </span>
                </div>
              }
            </div>
          </div>

          <div class="right-col">
            <div class="card resumo">
              <h2>Total do pedido</h2>

              <div class="resumo-row">
                <span>Subtotal</span>
                <span>{{ carrinho.valorTotal() | currency:'BRL' }}</span>
              </div>
              <div class="resumo-row">
                <span>Taxa de entrega</span>
                <span class="text-success">Grátis</span>
              </div>
              <div class="divider"></div>
              <div class="resumo-total">
                <span>Total</span>
                <span>{{ carrinho.valorTotal() | currency:'BRL' }}</span>
              </div>

              <button
                pButton
                label="Confirmar Pedido"
                icon="pi pi-check"
                iconPos="right"
                class="w-full btn-confirmar"
                [loading]="enviando()"
                (click)="confirmar()"
              ></button>

              <small class="info-text">
                <i class="pi pi-shield"></i>
                Pedido seguro - você recebe a confirmação por email
              </small>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1.5rem;
    }

    .left-col {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .card h2 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--gray-900);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .card h2 i {
      color: var(--primary-color);
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      margin-bottom: 1rem;
    }

    .form-field label {
      font-weight: 500;
      font-size: 0.875rem;
      color: var(--gray-700);
    }

    .form-field input, .form-field textarea {
      width: 100%;
    }

    .error {
      color: var(--danger-color);
      font-size: 0.75rem;
    }

    .pagamento-info {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--primary-color-light);
      border-radius: 8px;
      color: var(--primary-color-dark);
      font-size: 0.875rem;
    }

    .pagamento-info i {
      font-size: 1.25rem;
      margin-top: 0.125rem;
    }

    .item-resumo {
      display: grid;
      grid-template-columns: 40px 1fr auto;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--gray-100);
      align-items: center;
    }

    .item-resumo:last-child {
      border-bottom: none;
    }

    .qty {
      font-weight: 700;
      color: var(--primary-color);
    }

    .item-nome small {
      display: block;
      color: var(--gray-500);
      font-size: 0.75rem;
      margin-top: 0.125rem;
    }

    .item-preco {
      font-weight: 600;
      color: var(--gray-900);
    }

    /* Resumo */
    .resumo {
      position: sticky;
      top: 80px;
    }

    .resumo-row {
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

    .divider {
      height: 1px;
      background: var(--gray-200);
      margin: 0.75rem 0;
    }

    .resumo-total {
      display: flex;
      justify-content: space-between;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--gray-900);
      margin-bottom: 1.5rem;
    }

    .btn-confirmar {
      padding: 0.875rem !important;
      font-size: 1rem !important;
      background: var(--success-color) !important;
      border-color: var(--success-color) !important;
    }

    .info-text {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
      color: var(--gray-500);
      font-size: 0.8125rem;
    }

    .w-full { width: 100%; }

    .empty {
      text-align: center;
      padding: 4rem;
    }

    @media (max-width: 968px) {
      .checkout-grid {
        grid-template-columns: 1fr;
      }

      .resumo {
        position: static;
      }
    }
  `]
})
export class CheckoutComponent {
  carrinho = inject(CarrinhoService);
  private auth = inject(AuthService);
  private pedidoService = inject(PedidoService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  enviando = signal(false);

  form = this.fb.nonNullable.group({
    enderecoEntrega: ['', [Validators.required]],
    observacoes: ['']
  });

  confirmar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha o endereço de entrega'
      });
      return;
    }

    const itens = this.carrinho.itens().map(i => ({
      pratoId: i.prato.id,
      quantidade: i.quantidade,
      observacoes: i.observacoes
    }));

    const payload: PedidoRequest = {
      itens,
      enderecoEntrega: this.form.value.enderecoEntrega,
      observacoes: this.form.value.observacoes || undefined
    };

    this.enviando.set(true);
    this.pedidoService.criar(payload).subscribe({
      next: (pedido) => {
        this.enviando.set(false);
        this.carrinho.limpar();
        this.messageService.add({
          severity: 'success',
          summary: 'Pedido confirmado!',
          detail: `Pedido #${pedido.id} criado com sucesso`
        });
        this.router.navigate(['/pedido', pedido.id]);
      },
      error: (err) => {
        this.enviando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao criar pedido',
          detail: err.error?.message || 'Tente novamente'
        });
      }
    });
  }

  voltar() {
    this.router.navigate(['/carrinho']);
  }

  irAoCardapio() {
    this.router.navigate(['/cardapio']);
  }
}
