import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  Perfil,
  Usuario
} from '../models/models';

const TOKEN_KEY = 'comanda_token';
const USER_KEY = 'comanda_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // Signal reativo do usuário logado
  private currentUserSignal = signal<LoginResponse | null>(this.loadUserFromStorage());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => this.currentUserSignal()?.perfil === 'ADMIN');
  readonly isGerente = computed(() => {
    const p = this.currentUserSignal()?.perfil;
    return p === 'ADMIN' || p === 'GERENTE';
  });
  readonly isCozinheiro = computed(() => this.currentUserSignal()?.perfil === 'COZINHEIRO');
  readonly isCliente = computed(() => this.currentUserSignal()?.perfil === 'CLIENTE');

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(response => this.storeSession(response))
    );
  }

  register(data: RegisterRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUserRole(): Perfil | null {
    return this.currentUserSignal()?.perfil ?? null;
  }

  getUserId(): number | null {
    return this.currentUserSignal()?.usuarioId ?? null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private storeSession(response: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response));
    this.currentUserSignal.set(response);
  }

  private loadUserFromStorage(): LoginResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as LoginResponse;
    } catch {
      return null;
    }
  }
}
