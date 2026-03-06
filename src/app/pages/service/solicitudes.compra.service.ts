import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

export interface DetalleSolicitudPayload {
    id_producto?: number | null;
    nombre_producto_nuevo?: string;
    precio_venta_sugerido?: number;
    cantidad: number;
    valor_paquete: number;
    precio_unitario: number;
}

export interface SolicitudPayload {
    fecha: string;
    proveedor: string;
    observaciones?: string;
    productos: DetalleSolicitudPayload[];
}

@Injectable({
    providedIn: 'root'
})
export class SolicitudesCompraService {
    private readonly URL = `${environment.HOST}solicitudes-compra`;

    constructor(private http: HttpClient) {}

    getSolicitudes(): Observable<any> {
        return this.http.get(`${this.URL}/getSolicitudes`);
    }

    registrarSolicitud(payload: SolicitudPayload): Observable<any> {
        return this.http.post(`${this.URL}/insertSolicitud`, payload);
    }

    aprobarSolicitud(id: number): Observable<any> {
        return this.http.patch(`${this.URL}/aprobarSolicitud/${id}`, {});
    }

    rechazarSolicitud(id: number): Observable<any> {
        return this.http.patch(`${this.URL}/rechazarSolicitud/${id}`, {});
    }
}
