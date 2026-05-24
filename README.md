# Comanda Digital - Frontend

Frontend Angular 17 + PrimeNG para o sistema **Comanda Digital** (Dark Kitchen) - UNASP.

## 📋 Tecnologias

- **Angular 17** (standalone components, Signals, lazy loading)
- **PrimeNG 17** (UI components)
- **TypeScript 5**
- **RxJS** (HTTP, observables)
- **Chart.js** (gráficos do dashboard)
- **PrimeIcons** (ícones)

## ✅ Pré-requisitos

- **Node.js 18+** ([nodejs.org](https://nodejs.org))
- **npm 9+** (vem junto com o Node)
- **Backend Spring Boot rodando em `http://localhost:8080`**

## 🚀 Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em modo desenvolvimento
npm start
# ou
ng serve

# 3. Acessar no navegador
http://localhost:4200
```

O frontend se conecta automaticamente ao backend em `http://localhost:8080/api`.

## 🔐 Credenciais padrão (seed)

| Perfil | Email | Senha |
|--------|-------|-------|
| **Admin** | `admin@email.com` | `senha123` |
| **Cliente** | (cadastro público em `/cadastro`) | - |

## 🗂 Estrutura

```
src/app/
├── core/
│   ├── models/        # Interfaces e enums
│   ├── services/      # AuthService, AdminService, CardapioService, etc
│   ├── guards/        # authGuard, roleGuard
│   └── interceptors/  # JWT interceptor, error handler
├── layouts/           # ClienteLayout (header), AdminLayout (sidebar)
└── features/
    ├── auth/          # Login, Cadastro
    ├── cliente/       # Cardápio, Carrinho, Checkout, Meus Pedidos
    └── admin/         # Dashboard, Pedidos, Pratos, Ingredientes, Estoque, Fornecedores, Compras, Usuários
```

## 🎨 Funcionalidades

### Área do Cliente
- ✅ Cardápio público com filtro por categoria
- ✅ Detalhe do prato + adicionar ao carrinho
- ✅ Carrinho persistido no localStorage
- ✅ Checkout com confirmação
- ✅ Acompanhamento do pedido com timeline (polling 15s)
- ✅ Histórico de pedidos

### Área Admin
- ✅ **Dashboard** com KPIs, gráficos Chart.js e alertas de estoque
- ✅ **Pedidos da Cozinha** em layout kanban (5 colunas por status)
- ✅ **CRUD Categorias**
- ✅ **CRUD Pratos** com upload de foto via URL
- ✅ **Ficha Técnica** com FormArray, cálculo de custo e food cost colorido
- ✅ **CRUD Ingredientes**
- ✅ **Controle de Estoque** com saldo, alertas e saída manual
- ✅ **CRUD Fornecedores** + catálogo + cotação comparativa
- ✅ **Pedidos de Compra** (RASCUNHO → ENVIADO → RECEBIDO)
- ✅ **CRUD Usuários internos** (somente ADMIN)

## 🛡 Controle de Acesso

| Perfil | Acessa |
|--------|--------|
| **CLIENTE** | Cardápio, carrinho, pedidos próprios |
| **COZINHEIRO** | Pedidos da cozinha (CONFIRMADO → PRONTO) |
| **GERENTE** | Tudo do cozinheiro + dashboard + CRUDs + compras |
| **ADMIN** | Tudo do gerente + gestão de usuários |

## 🔧 Build de produção

```bash
npm run build
```

Os arquivos são gerados em `dist/comanda-frontend/`.

## 🐛 Troubleshooting

**Erro de CORS:** verificar se o backend está com CORS liberado para `http://localhost:4200`.

**401 ao logar:** verificar se o backend está rodando e se o seed foi aplicado pelo Flyway.

**Componentes PrimeNG sem estilo:** confirmar que o tema está configurado no `angular.json` (`lara-light-blue`).

---

**Desenvolvido por:** José Artur Silva Brito
**Disciplina:** Desenvolvimento Full-Stack (G01371.1)
**Professor:** Thiago Silva
**Instituição:** UNASP SP - 2026/1
