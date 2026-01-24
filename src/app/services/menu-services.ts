import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { environment } from 'src/enviroments/enviroment.';


@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(
    private http: HttpClient,
  ) { }

  menu(idUsuario: number): Observable<any> {
    console.log(idUsuario);
    return this.http.get<any>(environment.HOST + "menu/menuDinamico/" + idUsuario);
  }

  menuJson(params: object): Observable<any> {
    return this.http.post<any>(environment.HOST + "seguridad/menuJson", params);
  }
}
