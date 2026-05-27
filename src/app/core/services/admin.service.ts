import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Categoria,
  CategoriaRequest,
  Prato,
  PratoRequest,
  CustoResponse,
  FichaTecnica,
  Ingrediente,
  IngredienteRequest,
  Fornecedor,
  FornecedorRequest,
  FornecedorProduto,
  Compra,
  CompraRequest,
  Pedido,
  Usuario,
  UsuarioRequest,
  SaldoEstoque,
  MovimentacaoEstoque,
  DashboardResumo,
  TopPrato,
  Page,
  StatusPedido
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // ============ CATEGORIAS ============
  listarCategorias(page = 0, size = 20): Observable<Page<Categoria>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Categoria>>(`${this.apiUrl}/categorias`, { params });
  }

  buscarCategoria(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/categorias/${id}`);
  }

  criarCategoria(data: CategoriaRequest): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.apiUrl}/categorias`, data);
  }

  atualizarCategoria(id: number, data: CategoriaRequest): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/categorias/${id}`, data);
  }

  desativarCategoria(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categorias/${id}`);
  }

  // ============ PRATOS ============
  listarPratos(page = 0, size = 20): Observable<Page<Prato>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Prato>>(`${this.apiUrl}/pratos`, { params });
  }

  buscarPrato(id: number): Observable<Prato> {
    return this.http.get<Prato>(`${this.apiUrl}/pratos/${id}`);
  }

  criarPrato(data: PratoRequest): Observable<Prato> {
    return this.http.post<Prato>(`${this.apiUrl}/pratos`, data);
  }

  atualizarPrato(id: number, data: PratoRequest): Observable<Prato> {
    return this.http.put<Prato>(`${this.apiUrl}/pratos/${id}`, data);
  }

  desativarPrato(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pratos/${id}`);
  }

  alterarStatusPrato(id: number, status: string): Observable<Prato> {
    return this.http.patch<Prato>(`${this.apiUrl}/pratos/${id}/status`, { status });
  }

  custoPrato(id: number): Observable<CustoResponse> {
    return this.http.get<CustoResponse>(`${this.apiUrl}/pratos/${id}/custo`);
  }

  // ============ FICHA TECNICA ============
  buscarFichaTecnica(pratoId: number): Observable<FichaTecnica> {
    return this.http.get<FichaTecnica>(`${this.apiUrl}/pratos/${pratoId}/ficha`);
  }

  salvarFichaTecnica(pratoId: number, data: FichaTecnica): Observable<FichaTecnica> {
    return this.http.post<FichaTecnica>(`${this.apiUrl}/pratos/${pratoId}/ficha`, data);
  }

  // ============ INGREDIENTES ============
  listarIngredientes(page = 0, size = 50): Observable<Page<Ingrediente>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Ingrediente>>(`${this.apiUrl}/ingredientes`, { params });
  }

  buscarIngrediente(id: number): Observable<Ingrediente> {
    return this.http.get<Ingrediente>(`${this.apiUrl}/ingredientes/${id}`);
  }

  criarIngrediente(data: IngredienteRequest): Observable<Ingrediente> {
    return this.http.post<Ingrediente>(`${this.apiUrl}/ingredientes`, data);
  }

  atualizarIngrediente(id: number, data: IngredienteRequest): Observable<Ingrediente> {
    return this.http.put<Ingrediente>(`${this.apiUrl}/ingredientes/${id}`, data);
  }

  desativarIngrediente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/ingredientes/${id}`);
  }

  // ============ ESTOQUE ============
  saldoEstoque(): Observable<SaldoEstoque[]> {
    return this.http.get<SaldoEstoque[]>(`${this.apiUrl}/ingredientes/estoque/saldo`);
  }

  alertasEstoque(): Observable<SaldoEstoque[]> {
    return this.http.get<SaldoEstoque[]>(`${this.apiUrl}/ingredientes/estoque/alertas`);
  }

  saidaManual(data: any): Observable<MovimentacaoEstoque> {
    return this.http.post<MovimentacaoEstoque>(
      `${this.apiUrl}/ingredientes/estoque/movimentacao`,
      data
    );
  }

  // ============ FORNECEDORES ============
  listarFornecedores(page = 0, size = 20): Observable<Page<Fornecedor>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Fornecedor>>(`${this.apiUrl}/fornecedores`, { params });
  }

  buscarFornecedor(id: number): Observable<Fornecedor> {
    return this.http.get<Fornecedor>(`${this.apiUrl}/fornecedores/${id}`);
  }

  criarFornecedor(data: FornecedorRequest): Observable<Fornecedor> {
    return this.http.post<Fornecedor>(`${this.apiUrl}/fornecedores`, data);
  }

  atualizarFornecedor(id: number, data: FornecedorRequest): Observable<Fornecedor> {
    return this.http.put<Fornecedor>(`${this.apiUrl}/fornecedores/${id}`, data);
  }

  desativarFornecedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/fornecedores/${id}`);
  }

  produtosFornecedor(id: number): Observable<FornecedorProduto[]> {
    return this.http.get<FornecedorProduto[]>(`${this.apiUrl}/fornecedores/${id}/produtos`);
  }

  adicionarProdutoFornecedor(id: number, data: FornecedorProduto): Observable<FornecedorProduto> {
    return this.http.post<FornecedorProduto>(`${this.apiUrl}/fornecedores/${id}/produtos`, data);
  }

  cotacaoIngrediente(ingredienteId: number): Observable<FornecedorProduto[]> {
    return this.http.get<FornecedorProduto[]>(
      `${this.apiUrl}/fornecedores/cotacao/${ingredienteId}`
    );
  }

  // ============ COMPRAS ============
  listarCompras(page = 0, size = 20): Observable<Page<Compra>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Compra>>(`${this.apiUrl}/compras`, { params });
  }

  buscarCompra(id: number): Observable<Compra> {
    return this.http.get<Compra>(`${this.apiUrl}/compras/${id}`);
  }

  criarCompra(data: CompraRequest): Observable<Compra> {
    return this.http.post<Compra>(`${this.apiUrl}/compras`, data);
  }

  receberCompra(id: number): Observable<Compra> {
    return this.http.post<Compra>(`${this.apiUrl}/compras/${id}/receber`, {});
  }

  alterarStatusCompra(id: number, status: string): Observable<Compra> {
    return this.http.patch<Compra>(`${this.apiUrl}/compras/${id}/status`, { status });
  }

  // ============ PEDIDOS (admin) ============
  listarPedidosAdmin(page = 0, size = 20, status?: StatusPedido): Observable<Page<Pedido>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (status) params = params.set('status', status);
    return this.http.get<Page<Pedido>>(`${this.apiUrl}/pedidos`, { params });
  }

  buscarPedidoAdmin(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/pedidos/${id}`);
  }

  alterarStatusPedido(id: number, status: StatusPedido): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/pedidos/${id}/status`, { status });
  }

  cancelarPedido(id: number, motivo: string): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/pedidos/${id}/cancelar`, { motivo });
  }

  // ============ USUARIOS ============
  listarUsuarios(page = 0, size = 20): Observable<Page<Usuario>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Usuario>>(`${this.apiUrl}/usuarios`, { params });
  }

  buscarUsuario(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuarios/${id}`);
  }

  criarUsuario(data: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios`, data);
  }

  atualizarUsuario(id: number, data: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/usuarios/${id}`, data);
  }

  desativarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/usuarios/${id}`);
  }

  // ============ DASHBOARD ============
  dashboardResumo(): Observable<DashboardResumo> {
    return this.http.get<DashboardResumo>(`${this.apiUrl}/dashboard/resumo`);
  }

  topPratos(): Observable<TopPrato[]> {
    return this.http.get<TopPrato[]>(`${this.apiUrl}/dashboard/top-pratos`);
  }

  // ============ ALIASES (compatibilidade) ============
  removerCategoria(id: number) { return this.desativarCategoria(id); }
  removerPrato(id: number) { return this.desativarPrato(id); }
  removerIngrediente(id: number) { return this.desativarIngrediente(id); }
  reativarFornecedor(id: number): Observable<any> {
    return this.http.patch(`${this.api}/admin/fornecedores/${id}/reativar`, {});
  }

  removerFornecedor(id: number) { return this.desativarFornecedor(id); }
  removerUsuario(id: number) { return this.desativarUsuario(id); }
  listarProdutosFornecedor(id: number) { return this.produtosFornecedor(id); }
  registrarSaidaEstoque(data: any) { return this.saidaManual(data); }
  calcularCustoPrato(id: number) { return this.custoPrato(id); }

  listarPedidos(opts: { page?: number; size?: number; status?: StatusPedido } = {}): Observable<Page<Pedido>> {
    return this.listarPedidosAdmin(opts.page ?? 0, opts.size ?? 20, opts.status);
  }
}
