import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import { AuthService } from '@/services/auth-service';

export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const token = authService.getToken;

  if (token) {
    const cryptoToken = CryptoJS.AES.encrypt(token, 'crypto').toString();
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${cryptoToken}`,
      },
    });
    return next(authReq);
  }

  return next(req);
};
