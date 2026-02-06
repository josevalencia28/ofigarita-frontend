import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';
import { VentaDetalle } from './ventas.service';

export interface CarteraClienteDetalle {
    cantidad: number;
    producto: string;
    precio_unitario: number;
    subtotal: number;
}

export interface CarteraCliente {
    id_venta: number;
    fecha_venta: string;
    numero_id: number;
    nombre: string;
    forma_pago: string;
    estado_venta: string;
    total: number;
    detalle: CarteraClienteDetalle[] | null;
}

export interface CarteraClienteData {
    cartera_json: CarteraCliente;
}

export interface carteraClienteResponse {
    p_estado: number;
    data: CarteraClienteData[];
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

    actualizarTipoPago(id_venta: number, tipo_pago: string) {
        return this.http.post<any>(`${this.URL}/actualizarTipoPago`, { id_venta, tipo_pago });
    }
}
