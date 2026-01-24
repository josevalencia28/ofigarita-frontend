import { AuthService } from '@/services/auth-service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuarios } from 'src/entidades/Usuarios';

@Injectable({
    providedIn: 'root'
})
export class AuthRolesGuard {
    private usuario!: Usuarios;

    constructor(
        private authService: AuthService, 
        private router: Router
    ) { }

    canActivateChild(childRoute: ActivatedRouteSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

        this.usuario = this.authService.getUsuario;
        const data = childRoute.data;
        const request = { idUser: this.usuario.ID_SGUSUARIOS.toString(), ruta: data["permiso"] }

        if (data["permiso"]) {
            this.authService.verificarAccesoRuta(request).pipe(tap(res => {
                if (res.length > 0) {
                    return true;
                } else {
                    this.router.navigate(["notAuthorizated"]);
                    return false;
                }
            })).subscribe();
        }

        return true;
    }
}
