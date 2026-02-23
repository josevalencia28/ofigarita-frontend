import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

@Injectable({
    providedIn: 'root'
})

export class ProductoService {
    private readonly URL = `${environment.HOST}productos`;

    constructor(private http: HttpClient) { }

    getProductos(): Observable<any> {
        return this.http.get(`${this.URL}/getProductos`);
    }

    ingresarProducto(params: object): Observable<any> {
        return this.http.post<any>(this.URL + "/insertProducto", params);
    }

    actualizarProducto(id: number, params: object): Observable<any> {
        return this.http.patch<any>(`${this.URL}/updateProducto/${id}`, params);
    }

    eliminarProducto(id: number): Observable<any> {
        return this.http.delete<any>(`${this.URL}/deleteProducto/${id}`);
    }
}