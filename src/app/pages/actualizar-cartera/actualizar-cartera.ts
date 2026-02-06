import { Component } from '@angular/core';
import { CarteraClienteData, carteraClienteResponse, CarteraClienteService } from '../service/cartera-cliente.service';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-actualizar-cartera',
  imports: [TableModule, CardModule, ButtonModule, CommonModule, RippleModule, IconFieldModule, InputIconModule, InputTextModule],
  templateUrl: './actualizar-cartera.html',
  styleUrl: './actualizar-cartera.scss'
})

export class ActualizarCartera {
  loading: boolean = true;
  carteraCliente: any[] = [];
  expandedRows = {};

  constructor(private carteraClienteService: CarteraClienteService) { }

  ngOnInit(): void {
    this.getCarteraCliente();
    console.log(this.carteraCliente);
  }

  getCarteraCliente(): void {
    this.carteraCliente = [];
    this.carteraClienteService.getUltimasVentas().subscribe({
      next: (carteraCliente: carteraClienteResponse) => {
        console.log(carteraCliente);
        this.carteraCliente = carteraCliente.data.map((item: CarteraClienteData, index: number) => ({
          ...item.cartera_json,
          internalId: index,
          listaProductos: item.cartera_json.detalle ? item.cartera_json.detalle.map(d => d.producto).join(' ') : ''
        }));
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        console.error(error);
      }
    });
  }

  actualizarTipoPago(id_venta: number, tipo_pago: string): void {
    console.log(id_venta, tipo_pago);
    this.carteraClienteService.actualizarTipoPago(id_venta, tipo_pago).subscribe({
      next: (response: any) => {
        console.log(response);
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }
}
