import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then(m => m.HomeComponent)
  },
  // Redirect raiz
  // Autenticação
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./features/auth/cadastro.component').then(m => m.CadastroComponent)
  },

  // Área do Cliente (público + protegido)
  {
    path: '',
    loadComponent: () => import('./layouts/cliente-layout.component').then(m => m.ClienteLayoutComponent),
    children: [
      {
        path: 'cardapio',
        loadComponent: () => import('./features/cliente/cardapio/cardapio.component').then(m => m.CardapioComponent)
      },
      {
        path: 'cardapio/:id',
        loadComponent: () => import('./features/cliente/cardapio/prato-detalhe.component').then(m => m.PratoDetalheComponent)
      },
      {
        path: 'carrinho',
        loadComponent: () => import('./features/cliente/carrinho/carrinho.component').then(m => m.CarrinhoComponent)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/cliente/checkout/checkout.component').then(m => m.CheckoutComponent),
        canActivate: [authGuard]
      },
      {
        path: 'meus-pedidos',
        loadComponent: () => import('./features/cliente/meus-pedidos/meus-pedidos.component').then(m => m.MeusPedidosComponent),
        canActivate: [authGuard]
      },
      {
        path: 'pedido/:id',
        loadComponent: () => import('./features/cliente/meus-pedidos/acompanhar-pedido.component').then(m => m.AcompanharPedidoComponent),
        canActivate: [authGuard]
      }
    ]
  },

  // Área Admin
  {
    path: 'admin',
    loadComponent: () => import('./layouts/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'GERENTE', 'COZINHEIRO'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'GERENTE'] }
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./features/admin/pedidos/pedidos.component').then(m => m.PedidosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'GERENTE', 'COZINHEIRO'] }
      },
      {
        path: 'categorias',
        loadComponent: () => import('./features/admin/categorias/categorias.component').then(m => m.CategoriasComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'GERENTE'] }
      },
      {
        path: 'pratos',
        loadComponent: () => import('./features/admin/pratos/pratos.component').then(m => m.PratosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'GERENTE'] }
      },
      {
        path: 'pratos/:id/ficha',
        loadComponent: () => import('./features/admin/pratos/ficha-tecnica.component').then(m => m.FichaTecnicaComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'GERENTE'] }
      },
      {
        path: 'ingredientes',
        loadComponent: () => import('./features/admin/ingredientes/ingredientes.component').then(m => m.IngredientesComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'GERENTE'] }
      },
      {
        path: 'estoque',
        loadComponent: () => import('./features/admin/estoque/estoque.component').then(m => m.EstoqueComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'GERENTE'] }
      },
      {
        path: 'fornecedores',
        loadComponent: () => import('./features/admin/fornecedores/fornecedores.component').then(m => m.FornecedoresComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'GERENTE'] }
      },
      {
        path: 'compras',
        loadComponent: () => import('./features/admin/compras/compras.component').then(m => m.ComprasComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'GERENTE'] }
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/admin/usuarios/usuarios.component').then(m => m.UsuariosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      }
    ]
  },

  { path: '**', redirectTo: 'cardapio' }
];
