import { Injectable } from '@angular/core';
import { UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '@/services/auth-service';
import { HttpClient } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { environment } from 'src/enviroments/enviroment.';

@Injectable({
    providedIn: 'root'
})
export class TiendaClienteService {

    constructor(
        private http: HttpClient,
        private messageService: MessageService,
    ) {
    }

    getProductos(): Observable<any> {
        return this.http.get<any>(environment.HOST + "productos/getProductos");
    }

    verificarClientePorCedula(cedula: any): Observable<any> {
        return this.http.post<any>(environment.HOST + "clientes/verificarClientePorCedula", cedula);
    }

    iniciarProcesoVentaEnviatoken(params: object): Observable<any> {
        return this.http.post<any>(environment.HOST + "ventas/iniciarProcesoVenta", params);
    }

    procesarVenta(params: object): Observable<any> {
        return this.http.post<any>(environment.HOST + "ventas/validarYProcesarVenta", params);
    }

    estadoCuentaCliente(cedula: string): Observable<any> {
        return this.http.get<any>(environment.HOST + `estadoCuenta/getEstadoCuentaCliente/${cedula}`);
    }

}
