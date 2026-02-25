import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../service/producto.service';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-ingreso-producto',
  imports: [
    DialogModule, InputNumberModule, FormsModule, CardModule, CommonModule,
    TableModule, ButtonModule, InputTextModule, ToastModule, ConfirmDialogModule,
    TagModule, IconFieldModule, InputIconModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './ingreso-producto.html',
  styleUrl: './ingreso-producto.scss'
})
export class IngresoProducto implements OnInit {
  productos: Producto[] = [];
  loading: boolean = false;

  // Modal crear
  mostrarModalProducto: boolean = false;
  nombreProducto: string = '';
  precioVenta: number = 0;
  img: string = '';

  // Modal editar
  mostrarModalEditar: boolean = false;
  productoSeleccionado: Producto | null = null;
  editNombre: string = '';
  editPrecio: number = 0;
  editStock: number = 0;
  editImg: string = '';

  constructor(
    private productoService: ProductoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.getProductos();
  }

  getProductos() {
    this.messageService.clear();
    this.loading = true;
    this.productoService.getProductos().subscribe({
      next: (response) => {
        if (response.p_estado === 1 && response.data?.length > 0) {
          this.productos = response.data;
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar los productos' });
        this.loading = false;
      }
    });
  }

  abrirModalCrear() {
    this.mostrarModalProducto = true;
    this.limpiarFormulario();
  }

  cerrarModal() {
    this.mostrarModalProducto = false;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nombreProducto = '';
    this.precioVenta = 0;
    this.img = '';
  }

  crearProducto() {
    this.messageService.clear();
    if (!this.nombreProducto.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe ingresar el nombre del producto' });
      return;
    }
    if (this.precioVenta <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'El precio de venta debe ser mayor a 0' });
      return;
    }
    if (!this.img.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe ingresar el nombre de la imagen' });
      return;
    }

    const params = {
      nombre_producto: this.nombreProducto.trim(),
      precio_venta: this.precioVenta,
      img: this.img.trim(),
      estado: true
    };

    this.productoService.ingresarProducto(params).subscribe({
      next: (response) => {
        if (response.p_estado === 1) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: response.p_mensaje || 'Producto creado exitosamente' });
          this.cerrarModal();
          this.getProductos();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.p_mensaje || 'Error al crear el producto' });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al crear el producto' });
      }
    });
  }

  abrirModalEditar(producto: Producto) {
    this.productoSeleccionado = producto;
    this.editNombre = producto.nombre_producto;
    this.editPrecio = producto.precio_venta;
    this.editStock = producto.stock;
    this.editImg = producto.img;
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar() {
    this.mostrarModalEditar = false;
    this.productoSeleccionado = null;
  }

  actualizarProducto() {
    this.messageService.clear();
    if (!this.productoSeleccionado) return;

    if (!this.editNombre.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe ingresar el nombre del producto' });
      return;
    }
    if (this.editPrecio <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'El precio de venta debe ser mayor a 0' });
      return;
    }
    if (!this.editImg.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Debe ingresar el nombre de la imagen' });
      return;
    }

    const params = {
      nombre_producto: this.editNombre.trim(),
      precio_venta: this.editPrecio,
      stock: this.editStock,
      img: this.editImg.trim()
    };

    this.productoService.actualizarProducto(this.productoSeleccionado.id_producto, params).subscribe({
      next: (response) => {
        if (response.p_estado === 1) {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: response.p_mensaje || 'Producto actualizado exitosamente' });
          this.cerrarModalEditar();
          this.getProductos();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: response.p_mensaje || 'Error al actualizar el producto' });
        }
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar el producto' });
      }
    });
  }

  eliminarProducto(producto: Producto) {
    this.messageService.clear();
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar el producto ${producto.nombre_producto}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.productoService.eliminarProducto(producto.id_producto).subscribe({
          next: (response) => {
            if (response.p_estado === 1) {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: response.p_mensaje || 'Producto eliminado exitosamente' });
              this.getProductos();
            } else {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: response.p_mensaje || 'Error al eliminar el producto' });
            }
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar el producto' });
          }
        });
      }
    });
  }
}