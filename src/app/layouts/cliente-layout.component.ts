import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../core/services/auth.service';
import { CarrinhoService } from '../core/services/carrinho.service';

@Component({
  selector: 'app-cliente-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ButtonModule, BadgeModule, MenuModule],
  template: `
    <div class="layout">
      <header class="header">
        <div class="header-inner">
          <a routerLink="/cardapio" class="logo">
            <i class="pi pi-shopping-bag"></i>
            <span>Comanda Digital</span>
          </a>

          <nav class="nav-links">
            <a routerLink="/cardapio">Cardápio</a>
            @if (auth.isAuthenticated()) {
              <a routerLink="/meus-pedidos">Meus Pedidos</a>
            }
          </nav>

          <div class="header-actions">
            <div class="cart-wrapper">
              <button
                pButton
                icon="pi pi-shopping-cart"
                class="p-button-text cart-btn"
                (click)="goToCarrinho()"
              ></button>
              @if (carrinho.quantidadeTotal() > 0) {
                <span class="cart-badge">{{ carrinho.quantidadeTotal() }}</span>
              }
            </div>

            @if (auth.isAuthenticated()) {
              <button
                pButton
                [label]="auth.currentUser()?.nome ?? ''"
                icon="pi pi-user"
                class="p-button-text user-btn"
                (click)="menu.toggle($event)"
              ></button>
              <p-menu #menu [model]="menuItems" [popup]="true"></p-menu>
            } @else {
              <a routerLink="/login" class="login-link">Entrar</a>
            }
          </div>
        </div>
      </header>

      <main class="main">
        <router-outlet></router-outlet>
      </main>

      <footer class="footer">
        <p>© 2026 Comanda Digital - Dark Kitchen</p>
      </footer>
    </div>
  `,
  styles: [`
    .layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--gray-50);
    }

    .header {
      background: white;
      border-bottom: 1px solid var(--gray-200);
      box-shadow: var(--shadow-sm);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-inner {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.5rem;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary-color);
      text-decoration: none;
    }

    .logo i {
      font-size: 1.5rem;
    }

    .nav-links {
      display: flex;
      gap: 1.5rem;
      flex: 1;
    }

    .nav-links a {
      color: var(--gray-700);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.15s;
    }

    .nav-links a:hover {
      color: var(--primary-color);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .login-link {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border: 1px solid var(--primary-color);
      border-radius: var(--border-radius);
      transition: all 0.15s;
    }

    .login-link:hover {
      background: var(--primary-color);
      color: white;
    }

    .cart-wrapper {
      position: relative;
      display: inline-block;
    }

    .cart-btn {
      position: relative;
    }

    .cart-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--danger, #ef4444);
      color: white;
      border-radius: 999px;
      min-width: 20px;
      height: 20px;
      padding: 0 6px;
      font-size: 0.75rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .main {
      flex: 1;
    }

    .footer {
      background: white;
      padding: 1.5rem;
      text-align: center;
      color: var(--gray-500);
      border-top: 1px solid var(--gray-200);
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
    }
  `]
})
export class ClienteLayoutComponent {
  auth = inject(AuthService);
  carrinho = inject(CarrinhoService);
  private router = inject(Router);

  menuItems: MenuItem[] = [
    {
      label: 'Meus Pedidos',
      icon: 'pi pi-list',
      command: () => this.router.navigate(['/meus-pedidos'])
    },
    {
      separator: true
    },
    {
      label: 'Sair',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  goToCarrinho() {
    this.router.navigate(['/carrinho']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/cardapio']);
  }
}
