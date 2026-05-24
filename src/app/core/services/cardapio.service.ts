import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Prato, Categoria } from '../models/models';

@Injectable({ providedIn: 'root' })
export class CardapioService {
  private apiUrl = `${environment.apiUrl}/cardapio`;

  constructor(private http: HttpClient) {}

  listar(categoriaId?: number): Observable<Prato[]> {
    let params = new HttpParams();
    if (categoriaId) {
      params = params.set('categoriaId', categoriaId.toString());
    }
    return this.http.get<Prato[]>(this.apiUrl, { params });
  }

  detalhe(id: number): Observable<Prato> {
    return this.http.get<Prato>(`${this.apiUrl}/${id}`);
  }

  categorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/categorias`);
  }
}
