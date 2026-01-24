import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { environment } from 'src/enviroments/enviroment.';

export const cryptoInterceptor: HttpInterceptorFn = (req, next) => {
    const platformId = inject(PLATFORM_ID);

    if (isPlatformServer(platformId)) {
        return next(req);
    }

    if (req.method !== 'GET' && req.body) {
        const encrypted = CryptoJS.AES.encrypt(JSON.stringify(req.body), environment.CRYPTO_KEY).toString();

        req = req.clone({
            body: { data: encrypted },
            headers: req.headers.set('Content-Type', 'application/json')
        });
    }

    req = req.clone({
        responseType: 'text' as 'json'
    });

    return next(req).pipe(
        map((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse && typeof event.body === 'string') {
                const decrypted = CryptoJS.AES.decrypt(event.body, environment.CRYPTO_KEY).toString(CryptoJS.enc.Utf8);
                const parsed = JSON.parse(decrypted);
                return event.clone({ body: parsed });
            }

            return event;
        }),

        catchError((error: HttpErrorResponse | any) => {
            return throwError(() => error);
        })
    );
}