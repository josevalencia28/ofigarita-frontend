import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

export interface ProductoCompra {
    id_producto: number;
    cantidad: number;
    valor_paquete: number;
    precio_unitario: number;
}

export interface CompraPayload {
    fecha: string;
    proveedor: string;
    productos: ProductoCompra[];
}

@Injectable({
    providedIn: 'root'
})
export class IngresoCompraService {
    private readonly URL = `${environment.HOST}productos`;

    constructor(private http: HttpClient) { }

    getIngresoCompra(): Observable<any> {
        return this.http.get(`${this.URL}/getIngresos`);
    }

    registrarCompra(payload: CompraPayload): Observable<any> {
        return this.http.post(`${this.URL}/insertIngreso`, payload);
    }

    getProductos(): Observable<any[]> {
        return this.http.get<any[]>(`${this.URL}/getProductos`);
    }

    getProveedores(): Observable<any[]> {
        return this.http.get<any[]>(`${this.URL}/getProveedores`);
    }
}