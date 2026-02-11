import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment';

interface VentasResponse {
    totalHoy: Array<{ total_hoy: string }>;
    totalSemana: Array<{ total_semana: string }>;
    totalMes: Array<{ total_mes: string }>;
}


@Injectable({
    providedIn: 'root'
})

export class AnaliticaService {
    private readonly URL = `${environment.HOST}analitica`;

    constructor(private http: HttpClient) { }

    getTopVentas(): Observable<VentasResponse> {
        return this.http.get<VentasResponse>(`${this.URL}/topVentas`);
    }

    getUltimasCincoVentas(): Observable<any> {
        return this.http.get(`${this.URL}/getUltimasCincoVentas`);
    }
}