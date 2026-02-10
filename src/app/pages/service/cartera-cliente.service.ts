import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

export interface CarteraClienteDetalle {
    cantidad: number;
    producto: string;
    precio_unitario: number;
    subtotal: number;
}

export interface CarteraClienteVenta {
    id_venta: number;
    fecha_venta: string;
    total: number;
    forma_pago: string;
    estado_venta: string;
    detalle: CarteraClienteDetalle[] | null;
}

export interface CarteraCliente {
    numero_id: number;
    nombre: string;
    total: number;
    fecha_ultima_venta: string;
    ventas: CarteraClienteVenta[] | null;
}

export interface CarteraClienteData {
    cartera_json: CarteraCliente;
}

export interface carteraClienteResponse {
    p_estado: number;
    data: CarteraClienteData[];
}

export interface ActualizarPagoTotalRequest {
    numero_id: number;
    tipo_pago: string;
}

export interface ActualizarPagoIndividualRequest {
    id_venta: number;
    tipo_pago: string;
}

export interface ActualizarPagoTotalResponse {
    p_estado: number;
    p_mensaje: string;
    data?: {
        ventas_actualizadas: number;
        total_actualizado: number;
        ventas: any[];
    };
}

export interface ActualizarPagoIndividualResponse {
    p_estado: number;
    p_mensaje: string;
    data?: any;
}

@Injectable({
    providedIn: 'root'
})
export class CarteraClienteService {

    private readonly URL = `${environment.HOST}cartera-cliente`;

    constructor(private http: HttpClient) { }

    getUltimasVentas(): Observable<carteraClienteResponse> {
        return this.http.get<carteraClienteResponse>(`${this.URL}/getCarteraCliente`);
    }

    actualizarTipoPago(id_venta: number, tipo_pago: string): Observable<ActualizarPagoIndividualResponse> {
        return this.http.post<ActualizarPagoIndividualResponse>(
            `${this.URL}/actualizarTipoPago`, 
            { id_venta, tipo_pago }
        );
    }

    actualizarPagoTotal(numero_id: number, tipo_pago: string): Observable<ActualizarPagoTotalResponse> {
        return this.http.post<ActualizarPagoTotalResponse>(
            `${this.URL}/actualizarPagoTotal`, 
            { numero_id, tipo_pago }
        );
    }
}