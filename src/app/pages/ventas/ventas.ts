import { Component } from '@angular/core';
import { FacturaData, Venta, VentasResponse, VentasService } from '../service/ventas.service';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-ventas',
  imports: [TableModule, CardModule, ButtonModule, CommonModule, RippleModule, IconFieldModule, InputIconModule, InputTextModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.scss'
})
export class Ventas {

  loading: boolean = true;
  ventas: any[] = [];
  expandedRows = {};

  constructor(private ventasService: VentasService) { }

  ngOnInit(): void {
    this.getUltimasVentas();
  }

  getUltimasVentas(): void {
    this.ventas = [];
    this.ventasService.getUltimasVentas().subscribe({
      next: (ventas: VentasResponse) => {
        this.ventas = ventas.data.map((item: FacturaData, index: number) => ({
          ...item.factura_json,
          internalId: index,
          listaProductos: item.factura_json.detalle ? item.factura_json.detalle.map(d => d.producto).join(' ') : ''
        }));
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        console.error(error);
      }
    });
  }
}