import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

export interface DetalleProducto {
    cantidad: number;
    producto: string;
    precio_unitario: number;
    subtotal: number;
}

export interface FacturaJson {
    fecha_emision: string;
    nro_factura: string;
    fecha_vencimiento: string;
    numero_id: number;
    nombre: string;
    correo: string;
    total: number;
    detalle: DetalleProducto[];
}

export interface ClienteFactura {
    factura_json: FacturaJson;
}

export interface RespuestaClientes {
    p_estado: number;
    result?: ClienteFactura[];
    p_mensaje?: string;
}

export interface ResultadoEnvio {
    cliente: string;
    correo: string;
    factura: string;
    estado: 'ENVIADO' | 'FALLIDO';
}

export interface RespuestaNotificacion {
    p_estado: number;
    p_mensaje: string;
    resultado?: ResultadoEnvio;
    resultados?: {
        total: number;
        exitosos: number;
        fallidos: number;
        detalles: ResultadoEnvio[];
    };
}

@Injectable({
    providedIn: 'root'
})
export class NotificarFacturaService {
    private apiUrl = `${environment.HOST}notificacionFactura`;

    constructor(private http: HttpClient) { }

    getClientesNotificar(): Observable<RespuestaClientes> {
        return this.http.get<RespuestaClientes>(`${this.apiUrl}/getClientesNotificar`);
    }

    enviarNotificacionPuntual(numero_id: string): Observable<RespuestaNotificacion> {
        return this.http.post<RespuestaNotificacion>(`${this.apiUrl}/enviarNotificacionPuntual`, {
            numero_id
        });
    }

    enviarNotificacionMasiva(): Observable<RespuestaNotificacion> {
        return this.http.post<RespuestaNotificacion>(`${this.apiUrl}/enviarNotificaciones`, {});
    }
}