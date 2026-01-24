import { Injectable } from '@angular/core';
import { UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '@/services/auth-service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard {

    constructor(private authService: AuthService, private router: Router) { }

    canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        if (this.authService.isAuthenticated()) {
            if (this.isTokenExpirado()) {
                this.authService.logout();
                this.router.navigate(["auth"]);

                return false;
            }

            return true;
        }

        this.router.navigate(["auth"]);

        return false;
    }

    isTokenExpirado(): boolean {
        const token = this.authService.getToken;
        const payload = this.authService.obtenerPayload(token);
        const dateNow = new Date().getTime() / 1000;

        if (payload.exp < dateNow) {
            sessionStorage.setItem("expirado", "true");

            return true;
        }

        return false;
    }
}
