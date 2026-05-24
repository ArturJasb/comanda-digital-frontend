import { Injectable, signal, computed } from '@angular/core';
import { CarrinhoItem, Prato } from '../models/models';

const CARRINHO_KEY = 'comanda_carrinho';

@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private itensSignal = signal<CarrinhoItem[]>(this.loadFromStorage());

  readonly itens = this.itensSignal.asReadonly();

  readonly quantidadeTotal = computed(() =>
    this.itensSignal().reduce((acc, item) => acc + item.quantidade, 0)
  );

  readonly valorTotal = computed(() =>
    this.itensSignal().reduce(
      (acc, item) => acc + Number(item.prato.precoVenda) * item.quantidade,
      0
    )
  );

  readonly isEmpty = computed(() => this.itensSignal().length === 0);

  adicionar(prato: Prato, quantidade = 1, observacoes?: string): void {
    const itens = [...this.itensSignal()];
    const existente = itens.find(i => i.prato.id === prato.id);

    if (existente) {
      existente.quantidade += quantidade;
      if (observacoes) existente.observacoes = observacoes;
    } else {
      itens.push({ prato, quantidade, observacoes });
    }

    this.itensSignal.set(itens);
    this.saveToStorage();
  }

  alterarQuantidade(pratoId: number, quantidade: number): void {
    if (quantidade <= 0) {
      this.remover(pratoId);
      return;
    }
    const itens = this.itensSignal().map(item =>
      item.prato.id === pratoId ? { ...item, quantidade } : item
    );
    this.itensSignal.set(itens);
    this.saveToStorage();
  }

  remover(pratoId: number): void {
    this.itensSignal.set(this.itensSignal().filter(i => i.prato.id !== pratoId));
    this.saveToStorage();
  }

  limpar(): void {
    this.itensSignal.set([]);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    localStorage.setItem(CARRINHO_KEY, JSON.stringify(this.itensSignal()));
  }

  private loadFromStorage(): CarrinhoItem[] {
    const raw = localStorage.getItem(CARRINHO_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
}
