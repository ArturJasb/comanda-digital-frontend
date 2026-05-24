import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { Perfil } from '../models/models';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  const allowedRoles = route.data['roles'] as Perfil[];
  const userRole = authService.getUserRole();

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  messageService.add({
    severity: 'error',
    summary: 'Acesso negado',
    detail: 'Você não tem permissão para acessar esta página'
  });

  if (userRole === 'CLIENTE') {
    router.navigate(['/cardapio']);
  } else {
    router.navigate(['/admin/dashboard']);
  }
  return false;
};
