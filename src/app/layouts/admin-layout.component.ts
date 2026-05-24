import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../core/services/auth.service';
import { Perfil } from '../core/models/models';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: Perfil[];
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonModule, TooltipModule],
  template: `
    <div class="admin-layout" [class.sidebar-collapsed]="sidebarCollapsed()">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <i class="pi pi-shopping-bag logo-icon"></i>
          <span class="logo-text">Comanda</span>
        </div>

        <nav class="sidebar-nav">
          @for (item of menuFiltrado(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-item"
              [pTooltip]="sidebarCollapsed() ? item.label : ''"
              tooltipPosition="right"
            >
              <i [class]="item.icon"></i>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <button
            pButton
            [icon]="sidebarCollapsed() ? 'pi pi-angle-right' : 'pi pi-angle-left'"
            class="p-button-text p-button-rounded toggle-btn"
            (click)="toggleSidebar()"
          ></button>
        </div>
      </aside>

      <!-- Main area -->
      <div class="main-area">
        <header class="topbar">
          <div class="topbar-left">
            <h2 class="topbar-title">Painel Administrativo</h2>
          </div>
          <div class="topbar-right">
            <div class="user-info">
              <div class="user-avatar">
                {{ auth.currentUser()?.nome?.charAt(0) }}
              </div>
              <div>
                <div class="user-name">{{ auth.currentUser()?.nome }}</div>
                <div class="user-role">{{ auth.currentUser()?.perfil }}</div>
              </div>
            </div>
            <button
              pButton
              icon="pi pi-sign-out"
              class="p-button-text"
              pTooltip="Sair"
              (click)="logout()"
            ></button>
          </div>
        </header>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: var(--gray-50);
    }

    /* Sidebar */
    .sidebar {
      width: var(--sidebar-width);
      background: var(--gray-900);
      color: white;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 50;
    }

    .sidebar-collapsed .sidebar {
      width: 72px;
    }

    .sidebar-header {
      height: var(--header-height);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0 1.5rem;
      border-bottom: 1px solid var(--gray-700);
    }

    .logo-icon {
      font-size: 1.5rem;
      color: var(--primary-color);
    }

    .logo-text {
      font-size: 1.125rem;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
    }

    .sidebar-collapsed .logo-text,
    .sidebar-collapsed .nav-label {
      display: none;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--gray-300);
      text-decoration: none;
      border-radius: var(--border-radius);
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.15s;
      white-space: nowrap;
    }

    .nav-item:hover {
      background: var(--gray-800);
      color: white;
    }

    .nav-item.active {
      background: var(--primary-color);
      color: white;
    }

    .nav-item i {
      font-size: 1.125rem;
      min-width: 20px;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid var(--gray-700);
      display: flex;
      justify-content: center;
    }

    .toggle-btn {
      color: var(--gray-400) !important;
    }

    /* Main */
    .main-area {
      flex: 1;
      margin-left: var(--sidebar-width);
      transition: margin-left 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .sidebar-collapsed .main-area {
      margin-left: 72px;
    }

    .topbar {
      height: var(--header-height);
      background: white;
      border-bottom: 1px solid var(--gray-200);
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 40;
    }

    .topbar-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--gray-800);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: var(--primary-color);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      text-transform: uppercase;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--gray-800);
    }

    .user-role {
      font-size: 0.75rem;
      color: var(--gray-500);
    }

    .content {
      flex: 1;
      padding: 1.5rem;
      overflow-x: auto;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 72px;
      }
      .sidebar .logo-text,
      .sidebar .nav-label {
        display: none;
      }
      .main-area {
        margin-left: 72px;
      }
    }
  `]
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  sidebarCollapsed = signal(false);

  menu: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-chart-line', route: '/admin/dashboard', roles: ['ADMIN', 'GERENTE'] },
    { label: 'Pedidos', icon: 'pi pi-shopping-cart', route: '/admin/pedidos', roles: ['ADMIN', 'GERENTE', 'COZINHEIRO'] },
    { label: 'Cardápio', icon: 'pi pi-book', route: '/admin/pratos', roles: ['ADMIN', 'GERENTE'] },
    { label: 'Categorias', icon: 'pi pi-tags', route: '/admin/categorias', roles: ['ADMIN', 'GERENTE'] },
    { label: 'Ingredientes', icon: 'pi pi-list', route: '/admin/ingredientes', roles: ['ADMIN', 'GERENTE'] },
    { label: 'Estoque', icon: 'pi pi-box', route: '/admin/estoque', roles: ['ADMIN', 'GERENTE'] },
    { label: 'Fornecedores', icon: 'pi pi-truck', route: '/admin/fornecedores', roles: ['ADMIN', 'GERENTE'] },
    { label: 'Compras', icon: 'pi pi-dollar', route: '/admin/compras', roles: ['ADMIN', 'GERENTE'] },
    { label: 'Usuários', icon: 'pi pi-users', route: '/admin/usuarios', roles: ['ADMIN'] }
  ];

  menuFiltrado() {
    const role = this.auth.getUserRole();
    if (!role) return [];
    return this.menu.filter(item => item.roles.includes(role));
  }

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
