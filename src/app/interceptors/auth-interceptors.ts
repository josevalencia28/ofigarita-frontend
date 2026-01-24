import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { AuthService } from '@/services/auth-service';
import { Usuarios } from 'src/entidades/Usuarios';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError(e => {
      // 🚫 Sesión expirada
      if (e.status === 401) {
        authService.logout();

        Swal.fire({
          icon: 'info',
          title: 'SESIÓN CADUCADA',
          text: 'La sesión ha caducado, por favor vuelva a iniciar sesión',
          allowOutsideClick: false,
        }).then(result => {
          if (result.isConfirmed) {
            authService.setToken = '';
            authService.setUsuario = new Usuarios();
            sessionStorage.clear();
            router.navigate(['login']);
          }
        });
      }

      // 🚷 Acceso prohibido
      if (e.status === 403) {
        router.navigate(['Access']);
      }

      return throwError(() => e);
    })
  );
};
