import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.logout();
        router.navigate(['/login']);
        messageService.add({
          severity: 'warn',
          summary: 'Sessão expirada',
          detail: 'Faça login novamente'
        });
      } else if (error.status === 403) {
        messageService.add({
          severity: 'error',
          summary: 'Acesso negado',
          detail: 'Você não tem permissão para esta ação'
        });
      } else if (error.status === 422 || error.status === 400) {
        const msg = error.error?.message || 'Dados inválidos';
        messageService.add({
          severity: 'warn',
          summary: 'Erro de validação',
          detail: msg
        });
      } else if (error.status >= 500) {
        messageService.add({
          severity: 'error',
          summary: 'Erro no servidor',
          detail: 'Tente novamente em instantes'
        });
      }
      return throwError(() => error);
    })
  );
};
