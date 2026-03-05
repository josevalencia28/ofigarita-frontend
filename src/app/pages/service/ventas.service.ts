import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

export interface VentaDetalle {
    producto: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
}

export interface Compra {
    id_venta: number;
    fecha_venta: string;
    forma_pago: string;
    estado_venta: string;
    subtotal_compra: number;
    productos: VentaDetalle[] | null;
}

export interface VentaCliente {
    numero_id: number;
    nombre: string;
    total: number;
    compras: Compra[];
}

export interface FacturaData {
    factura_json: VentaCliente;
}

export interface VentasResponse {
    p_estado: number;
    data: FacturaData[];
}

@Injectable({
    providedIn: 'root'
})

export class VentasService {
    private readonly URL = `${environment.HOST}ventas`;

    constructor(private http: HttpClient) { }

    getUltimasVentas(): Observable<VentasResponse> {
        return this.http.get<VentasResponse>(`${this.URL}/getUltimasVentas`);
    }

    streamNuevasVentas(): Observable<any> {
        return new Observable(observer => {
            const source = new EventSource(`${this.URL}/stream`);
            source.onmessage = (event) => {
                observer.next(JSON.parse(event.data));
            };
            source.onerror = () => {
                source.close();
                observer.error('SSE connection error');
            };
            return () => source.close();
        });
    }
}