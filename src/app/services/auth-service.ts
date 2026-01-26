import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Usuarios } from 'src/entidades/Usuarios';
import { SessionService } from './session-service';
import { environment } from 'src/enviroments/enviroment';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _usuario;
  private _token = '';

  constructor(
    private http:HttpClient,
    private messageService: MessageService,
    private sessionService: SessionService
  ){
    this._usuario = new Usuarios();
  }

  get getUsuario(): Usuarios {
        const user = this.sessionService.getItem('user');
        if (this._usuario != null) {
            return this._usuario;
        } else if (this._usuario == null && user != null) {
            this._usuario = user || "";
            return this._usuario;
        };

        return new Usuarios();
    }

    set setUsuario(usuario: Usuarios) {
        this._usuario = usuario;
    }

    set setToken(token: string) {
        this._token = token;
    }

    get getToken(): any {
        const token = this.sessionService.getItem('token');

        if (this._token != null && this._token != undefined && this._token != "") {
            return this._token;
        } else if ((this._token == null || this._token == "") && token != null) {
            this._token = token || "";
            return this._token;
        };

        return null;
    }

    login(credenciales: object): Observable<any> {
        return this.http.post<any>(environment.HOST + "seguridad/login", credenciales);
    }

    logout(): Observable<any> {
        const user = this.getUsuario;
        const p_token = this.getToken;

        return this.http.post<any>(environment.HOST + 'seguridad/logout', { 'p_username': user.USERNAME, p_token });
    }

    guardarUsuario(token: any): void {
        const payload = this.obtenerPayload(token);
        this._usuario.ID_SGUSUARIOS = payload.uid;
        this._usuario.USERNAME = payload.username;
        this._usuario.NOMBRES = payload.data.NOMBRE;
        this._usuario.TIPO_IDENTIFICACION = payload.data.TIPO_IDENTIFICACION;
        this._usuario.NUMERO_ID = payload.data.NUMERO_ID;
        this._usuario.TELEFONO = payload.data.TELEFONO;
        this._usuario.DIRECCION = payload.data.DIRECCION;
        this.sessionService.setItem('user', this._usuario);
    }

    guardarToken(accessToken: any): void {
        this._token = accessToken;
        this.sessionService.setItem('token', this._token);
    }

    obtenerPayload(accessToken: any): any {
        if (accessToken) {
            const arrayToken = accessToken.split(".");
            const payload = arrayToken[1];

            return JSON.parse(atob(payload));
        }

        return null;
    }

    isAuthenticated(): boolean {
        const payload = this.obtenerPayload(this.getToken);

        if (payload != null && payload.username && payload.username.length > 0) {
            return true;
        }

        return false;
    }

    cambiarPassword(datos: any): Observable<any> {
        return this.http.post<any>(environment.HOST + 'seguridad/updatePassword', datos).pipe(
            catchError(e => {
                if (e.status === 400) {
                    e.error.message[0]
                    this.messageService.clear();
                    this.messageService.add({
                        severity: 'error', summary: 'Error Bad Request!',
                        detail: "por favor revisar la informacion que se esta enviando, " + e.error.message[0]
                    });
                }

                return throwError(() => e);
            })
        );
    }

    verificarAccesoRuta(info: object) {
        return this.http.post<any>(environment.HOST + "seguridad/verificaRuta", info).pipe(
            catchError(e => {
                if (e.status === 400) {
                    e.error.message[0]
                    this.messageService.clear();
                    this.messageService.add({
                        severity: 'error', summary: 'Error Bad Request!',
                        detail: "por favor revisar la informacion que se esta enviando, " + e.error.message[0]
                    });
                }

                return throwError(() => e);
            })
        );
    }
}
