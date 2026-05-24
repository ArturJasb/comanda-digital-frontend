import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pedido, PedidoRequest, StatusPedido } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private apiUrl = `${environment.apiUrl}/pedidos`;

  constructor(private http: HttpClient) {}

  criar(data: PedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, data);
  }

  meusPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/meus`);
  }

  status(id: number): Observable<{ status: StatusPedido }> {
    return this.http.get<{ status: StatusPedido }>(`${this.apiUrl}/${id}/status`);
  }
}
