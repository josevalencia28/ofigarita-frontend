import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompraPayload, IngresoCompraService, ProductoCompra } from '../service/ingreso.compra.service';
import { MessageService } from 'primeng/api';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { ProductoService } from '../service/producto.service';

export interface CompraAgrupada {
  id_ingreso: number;
  fecha: string;
  proveedor: string;
  total_compra: number;
  productos: ProductoDetalle[];
}

export interface ProductoDetalle {
  id_producto: number | null;
  nombre_producto: string | null;
  precio_venta: number | null;
  precio_unitario: number | null;
  valor_paquete: number | null;
  cantidad: number | null;
  id_ip: number | null;
}

interface Producto {
  id_producto: number;
  nombre_producto: string;
  precio_venta: number;
  stock: number;
  egreso: number;
  img: string;
  fcha_rgstro: string;
  estado: boolean;
}

@Component({
  selector: 'app-ingreso-compra',
  standalone: true,
  imports: [
    DialogModule, InputNumberModule, FormsModule, CardModule, CommonModule,
    TableModule, ButtonModule, InputTextModule, ToastModule, ConfirmDialogModule,
    TagModule, IconFieldModule, InputIconModule, SelectModule
  ],
  providers: [MessageService],
  templateUrl: './ingreso-compra.html',
  styleUrl: './ingreso-compra.scss'
})
export class IngresoCompra implements OnInit {

  compras: CompraAgrupada[] = [];
  productos: Producto[] = [];
  loading = false;
  loadingProductos = false;

  showModalNueva = false;
  guardando = false;

  nuevaCompra: CompraPayload = { fecha: '', proveedor: '', productos: [] };

  productoTemp: ProductoCompra = {
    id_producto: 0, cantidad: 0, valor_paquete: 0, precio_unitario: 0
  };

  productoSeleccionado: Producto | null = null;

  showModalDetalle = false;
  compraSeleccionada: CompraAgrupada | null = null;

  showModalEliminar = false;
  compraAEliminar: CompraAgrupada | null = null;

  constructor(
    private ingresoCompraService: IngresoCompraService,
    private productoService: ProductoService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.cargarCompras();
    this.getProductos();
  }

  getProductos(): void {
    this.loadingProductos = true;
    this.messageService.clear();
    this.productoService.getProductos().subscribe({
      next: (response) => {
        if (response.p_estado === 1 && response.data?.length > 0) {
          this.productos = response.data;
        }
        this.loadingProductos = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error', summary: 'Error', detail: 'Error al cargar los productos'
        });
        this.loadingProductos = false;
      }
    });
  }

  onProductoSeleccionado(producto: Producto | null): void {
    if (producto) {
      this.productoTemp.id_producto = producto.id_producto;
    } else {
      this.productoTemp.id_producto = 0;
    }
    // this.onCantidadChange();
  }

  cargarCompras(): void {
    this.loading = true;
    this.messageService.clear();
    this.ingresoCompraService.getIngresoCompra().subscribe({
      next: (response) => {
        this.compras = this.agruparPorIngreso(response.data);
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las compras.'
        });
        this.loading = false;
        console.error(err);
      }
    });
  }

  private agruparPorIngreso(rows: any[]): CompraAgrupada[] {
    const map = new Map<number, CompraAgrupada>();
    for (const row of rows) {
      if (!map.has(row.id_ingreso)) {
        map.set(row.id_ingreso, {
          id_ingreso: row.id_ingreso,
          fecha: row.fecha,
          proveedor: row.proveedor,
          total_compra: row.total_compra,
          productos: []
        });
      }
      if (row.id_producto !== null) {
        map.get(row.id_ingreso)!.productos.push({
          id_producto: row.id_producto,
          nombre_producto: row.nombre_producto,
          precio_venta: row.precio_venta,
          precio_unitario: row.precio_unitario,
          valor_paquete: row.valor_paquete,
          cantidad: row.cantidad,
          id_ip: row.id_ip
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.id_ingreso - a.id_ingreso);
  }

  abrirModalNueva(): void {
    this.nuevaCompra = {
      fecha: new Date().toISOString().split('T')[0],
      proveedor: '',
      productos: []
    };
    this.resetProductoTemp();
    this.showModalNueva = true;
  }

  cerrarModalNueva(): void {
    this.showModalNueva = false;
  }

  resetProductoTemp(): void {
    this.productoTemp = { id_producto: 0, cantidad: 0, valor_paquete: 0, precio_unitario: 0 };
    this.productoSeleccionado = null;
  }

  // onCantidadChange(): void {
  //   // Solo calcula automáticamente si el precio unitario está en 0 (no fue editado manualmente)
  //   if (this.productoTemp.precio_unitario === 0) {
  //     if (this.productoTemp.cantidad > 0 && this.productoTemp.valor_paquete > 0) {
  //       this.productoTemp.precio_unitario =
  //         +(this.productoTemp.valor_paquete / this.productoTemp.cantidad).toFixed(2);
  //     }
  //   }
  // }

  agregarProducto(): void {
    if (!this.productoTemp.id_producto || this.productoTemp.cantidad <= 0 || this.productoTemp.valor_paquete <= 0) return;

    const yaExiste = this.nuevaCompra.productos.some(p => p.id_producto === this.productoTemp.id_producto);
    if (yaExiste) {
      this.messageService.add({
        severity: 'warn', summary: 'Aviso',
        detail: 'Este producto ya fue agregado a la lista.'
      });
      return;
    }

    this.nuevaCompra.productos.push({ ...this.productoTemp });
    this.resetProductoTemp();
  }

  quitarProducto(index: number): void {
    this.nuevaCompra.productos.splice(index, 1);
  }

  getNombreProducto(id: number): string {
    const p = this.productos.find(p => p.id_producto === id);
    return p ? p.nombre_producto : `ID: ${id}`;
  }

  get totalCompra(): number {
    return this.nuevaCompra.productos.reduce((acc, p) => acc + p.valor_paquete, 0);
  }

  formValido(): boolean {
    return !!(this.nuevaCompra.fecha && this.nuevaCompra.proveedor && this.nuevaCompra.productos.length > 0);
  }

  guardarCompra(): void {
    if (!this.formValido()) return;
    this.messageService.clear();
    this.guardando = true;
    this.ingresoCompraService.registrarCompra(this.nuevaCompra).subscribe({
      next: () => {
        this.guardando = false;
        this.messageService.add({
          severity: 'success', summary: 'Éxito', detail: 'Compra registrada correctamente.'
        });
        this.cerrarModalNueva();
        this.cargarCompras();
      },
      error: (err) => {
        this.guardando = false;
        this.messageService.add({
          severity: 'error', summary: 'Error', detail: 'No se pudo registrar la compra.'
        });
        console.error(err);
      }
    });
  }

  verDetalle(compra: CompraAgrupada): void {
    this.compraSeleccionada = compra;
    this.showModalDetalle = true;
  }

  cerrarModalDetalle(): void {
    this.showModalDetalle = false;
    this.compraSeleccionada = null;
  }

  confirmarEliminar(compra: CompraAgrupada): void {
    this.compraAEliminar = compra;
    this.showModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    this.showModalEliminar = false;
    this.compraAEliminar = null;
  }

  eliminarCompra(): void {
    this.cerrarModalEliminar();
    this.cargarCompras();
  }
}