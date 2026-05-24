// ============ ENUMS ============
export type Perfil = 'ADMIN' | 'GERENTE' | 'COZINHEIRO' | 'CLIENTE';
export type StatusPrato = 'ATIVO' | 'INATIVO' | 'PAUSADO';
export type StatusPedido =
  | 'RECEBIDO'
  | 'CONFIRMADO'
  | 'EM_PREPARO'
  | 'PRONTO'
  | 'SAIU_ENTREGA'
  | 'FINALIZADO'
  | 'CANCELADO';
export type StatusCompra = 'RASCUNHO' | 'ENVIADO' | 'RECEBIDO' | 'CANCELADO';
export type UnidadePadrao = 'G' | 'ML' | 'UN' | 'KG' | 'L';

// ============ AUTH ============
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  usuarioId: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  endereco?: string;
}

// ============ USUARIO ============
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  telefone?: string;
  endereco?: string;
  status: string;
  createdAt: string;
}

export interface UsuarioRequest {
  nome: string;
  email: string;
  senha?: string;
  perfil: Perfil;
  telefone?: string;
  endereco?: string;
}

// ============ CATEGORIA ============
export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  ordem?: number;
  status: string;
}

export interface CategoriaRequest {
  nome: string;
  descricao?: string;
  ordem?: number;
}

// ============ PRATO ============
export interface Prato {
  id: number;
  nome: string;
  descricao?: string;
  fotoUrl?: string;
  precoVenda: number;
  tempoPreparoMin?: number;
  status: StatusPrato;
  categoria: Categoria;
  createdAt: string;
}

export interface PratoRequest {
  nome: string;
  descricao?: string;
  fotoUrl?: string;
  precoVenda: number;
  tempoPreparoMin?: number;
  categoriaId: number;
}

export interface CustoResponse {
  custo: number;
  foodCost: number;
  precoVenda: number;
}

// ============ INGREDIENTE ============
export interface Ingrediente {
  id: number;
  nome: string;
  sku: string;
  unidadePadrao: UnidadePadrao;
  estoqueMinimo: number;
  custoUnitario: number;
  status: string;
}

export interface IngredienteRequest {
  nome: string;
  sku: string;
  unidadePadrao: UnidadePadrao;
  estoqueMinimo: number;
  custoUnitario?: number;
}

// ============ FICHA TECNICA ============
export interface FichaTecnicaItem {
  id?: number;
  ingredienteId: number;
  ingredienteNome?: string;
  quantidade: number;
  unidade: string;
  fatorCorrecao: number;
}

export interface FichaTecnica {
  id?: number;
  pratoId: number;
  rendimento: number;
  modoPreparo?: string;
  itens: FichaTecnicaItem[];
}

// ============ FORNECEDOR ============
export interface Fornecedor {
  id: number;
  razaoSocial: string;
  cnpj: string;
  telefone?: string;
  email?: string;
  categoriasProdutos?: string;
  status: string;
}

export interface FornecedorRequest {
  razaoSocial: string;
  cnpj: string;
  telefone?: string;
  email?: string;
  categoriasProdutos?: string;
}

export interface FornecedorProduto {
  id?: number;
  fornecedorId?: number;
  ingredienteId: number;
  ingredienteNome?: string;
  preco: number;
  unidadeVenda: string;
}

// ============ COMPRA ============
export interface CompraItem {
  id?: number;
  ingredienteId: number;
  ingredienteNome?: string;
  quantidade: number;
  precoUnitario: number;
  subtotal?: number;
}

export interface Compra {
  id: number;
  fornecedorId: number;
  fornecedorNome?: string;
  status: StatusCompra;
  valorTotal: number;
  itens: CompraItem[];
  createdAt: string;
}

export interface CompraRequest {
  fornecedorId: number;
  itens: CompraItem[];
}

// ============ PEDIDO ============
export interface PedidoItem {
  id?: number;
  pratoId: number;
  pratoNome?: string;
  quantidade: number;
  precoUnitario?: number;
  observacoes?: string;
}

export interface Pedido {
  id: number;
  clienteId: number;
  clienteNome: string;
  status: StatusPedido;
  valorTotal: number;
  enderecoEntrega?: string;
  observacoes?: string;
  motivoCancelamento?: string;
  itens: PedidoItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PedidoRequest {
  itens: PedidoItem[];
  enderecoEntrega?: string;
  observacoes?: string;
}

// ============ ESTOQUE ============
export interface SaldoEstoque {
  ingredienteId: number;
  nome: string;
  sku: string;
  saldo: number;
  estoqueMinimo: number;
  unidadePadrao: string;
  abaixoMinimo: boolean;
}

export interface MovimentacaoEstoque {
  id: number;
  ingredienteId: number;
  ingredienteNome: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'ESTORNO';
  motivo: string;
  quantidade: number;
  lote?: string;
  validade?: string;
  custoUnitario?: number;
  createdAt: string;
}

// ============ DASHBOARD ============
export interface DashboardResumo {
  faturamentoHoje: number;
  pedidosHoje: number;
  ticketMedio: number;
  foodCostMedio: number;
  alertasEstoque: number;
}

export interface TopPrato {
  pratoId: number;
  pratoNome: string;
  quantidadeVendida: number;
  faturamento: number;
}

// ============ PAGINAÇÃO ============
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// ============ CARRINHO (local) ============
export interface CarrinhoItem {
  prato: Prato;
  quantidade: number;
  observacoes?: string;
}

// ============ ALIASES (compatibilidade com nomes "Response" do backend) ============
export type CategoriaResponse = Categoria;
export type PratoResponse = Prato;
export type IngredienteResponse = Ingrediente;
export type FornecedorResponse = Fornecedor;
export type UsuarioResponse = Usuario;
export type FichaTecnicaResponse = FichaTecnica;
export type CompraResponse = Compra;
export type PedidoResponse = Pedido;
