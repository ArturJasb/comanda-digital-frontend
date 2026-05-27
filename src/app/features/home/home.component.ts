import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Categoria { id: number; nome: string; }
interface Prato {
  id: number; nome: string; descricao: string;
  fotoUrl: string; precoVenda: number; tempoPreparo: number;
  categoria: { id: number; nome: string };
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  categorias = signal<Categoria[]>([]);
  destaques  = signal<Prato[]>([]);
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.http.get<Categoria[]>(`${this.apiUrl}/cardapio/categorias`).subscribe({
      next: (d) => this.categorias.set(d),
      error: () => this.categorias.set([
        { id: 1, nome: 'Lanches' }, { id: 2, nome: 'Açaí' },
        { id: 3, nome: 'Bebidas' }, { id: 4, nome: 'Sobremesas' }
      ])
    });
    this.http.get<any>(`${this.apiUrl}/cardapio`).subscribe({
      next: (d) => this.destaques.set((d.content ?? d).slice(0, 6)),
      error: () => this.destaques.set([])
    });
  }

  irParaCardapio(categoriaId?: number): void {
    this.router.navigate(['/cardapio'],
      categoriaId ? { queryParams: { categoriaId } } : {});
  }

  formatarPreco(v: number): string {
    return v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ?? '';
  }

  getIconeCategoria(nome: string): string {
    const m: Record<string, string> = {
      'lanches':'🍔','burger':'🍔','hamburguer':'🍔',
      'açaí':'🫐','acai':'🫐','bebidas':'🥤',
      'sobremesas':'🍰','pizza':'🍕','salada':'🥗',
      'combo':'🎁','frango':'🍗'
    };
    const k = nome.toLowerCase();
    for (const key of Object.keys(m)) { if (k.includes(key)) return m[key]; }
    return '🍽️';
  }
}
