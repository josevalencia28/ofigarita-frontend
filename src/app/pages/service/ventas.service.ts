export interface VentaDetalle {
    cantidad: number;
    producto: string;
    precio_unitario: number;
    subtotal: number;
}

export interface Venta {
    fecha_venta: string;
    numero_id: number;
    nombre: string;
    forma_pago: string;
    estado_venta: string;
    total: number;
    detalle: VentaDetalle[] | null;
}

export interface FacturaData {
    factura_json: Venta;
}

export interface VentasResponse {
    p_estado: number;
    data: FacturaData[];
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

@Injectable({
    providedIn: 'root'
})
export class VentasService {
    private readonly URL = `${environment.HOST}ventas`;

    constructor(private http: HttpClient) { }

    getUltimasVentas(): Observable<VentasResponse> {
        return this.http.get<VentasResponse>(`${this.URL}/getUltimasVentas`);
    }
}
