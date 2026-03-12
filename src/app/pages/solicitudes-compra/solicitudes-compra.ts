import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { SolicitudesCompraService, SolicitudPayload, DetalleSolicitudPayload } from '../service/solicitudes.compra.service';
import { ProductoService } from '../service/producto.service';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Toast } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

export interface DetalleSolicitud {
    id_detalle: number;
    id_producto: number | null;
    nombre_producto: string;
    es_nuevo: boolean;
    cantidad: number;
    valor_paquete: number;
    precio_unitario: number;
    precio_venta_sugerido: number;
}

export interface SolicitudAgrupada {
    id_solicitud: number;
    fecha: string;
    proveedor: string | null;
    total_estimado: number;
    estado: string;
    observaciones: string | null;
    fcha_rgstro: string;
    productos: DetalleSolicitud[] | null;
}

interface Producto {
    id_producto: number;
    nombre_producto: string;
    precio_venta: number;
    stock: number;
}

interface ProductoTemp {
    es_nuevo: boolean;
    id_producto: number | null;
    nombre_producto_nuevo: string;
    precio_venta_sugerido: number;
    cantidad: number;
    valor_paquete: number;
    precio_unitario: number;
}

@Component({
    selector: 'app-solicitudes-compra',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        TableModule, ButtonModule, InputTextModule, Toast,
        TagModule, IconFieldModule, InputIconModule, DialogModule,
        InputNumberModule, SelectModule, CheckboxModule, TextareaModule, TooltipModule
    ],
    providers: [MessageService],
    templateUrl: './solicitudes-compra.html',
    styleUrl: './solicitudes-compra.scss'
})
export class SolicitudesCompra implements OnInit {

    solicitudes: SolicitudAgrupada[] = [];
    productos: Producto[] = [];
    loading = false;
    loadingProductos = false;
    guardando = false;
    aprobando = false;
    rechazando = false;

    get solicitudesPendientes(): number {
        return this.solicitudes.filter(s => s.estado === 'PENDIENTE').length;
    }
    get solicitudesAprobadas(): number {
        return this.solicitudes.filter(s => s.estado === 'APROBADA').length;
    }
    get solicitudesRechazadas(): number {
        return this.solicitudes.filter(s => s.estado === 'RECHAZADA').length;
    }
    get totalEstimadoPendientes(): number {
        return this.solicitudes.filter(s => s.estado === 'PENDIENTE')
            .reduce((sum, s) => sum + Number(s.total_estimado), 0);
    }

    // Modal nueva solicitud
    showModalNueva = false;
    nuevaSolicitud: SolicitudPayload = { fecha: '', proveedor: '', productos: [] };
    productoTemp: ProductoTemp = this.getProductoTempVacio();
    productoSeleccionado: Producto | null = null;

    // Modal detalle
    showModalDetalle = false;
    solicitudSeleccionada: SolicitudAgrupada | null | undefined;

    // Modal aprobar
    showModalAprobar = false;
    solicitudAGestionar: SolicitudAgrupada | null | undefined;

    // Modal rechazar
    showModalRechazar = false;

    constructor(
        private solicitudesService: SolicitudesCompraService,
        private productoService: ProductoService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.cargarSolicitudes();
        this.cargarProductos();
    }

    private getProductoTempVacio(): ProductoTemp {
        return {
            es_nuevo: false,
            id_producto: null,
            nombre_producto_nuevo: '',
            precio_venta_sugerido: 0,
            cantidad: 0,
            valor_paquete: 0,
            precio_unitario: 0,
        };
    }

    cargarSolicitudes(): void {
        this.loading = true;
        this.solicitudesService.getSolicitudes().subscribe({
            next: (res) => {
                this.solicitudes = res.data ?? [];
                this.loading = false;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las solicitudes.' });
                this.loading = false;
            }
        });
    }

    cargarProductos(): void {
        this.loadingProductos = true;
        this.productoService.getProductos().subscribe({
            next: (res) => {
                this.productos = res.data ?? [];
                this.loadingProductos = false;
            },
            error: () => { this.loadingProductos = false; }
        });
    }

    // ── Modal nueva solicitud ──────────────────────────────────────────────────

    abrirModalNueva(): void {
        this.nuevaSolicitud = {
            fecha: new Date().toISOString().split('T')[0],
            proveedor: '',
            observaciones: '',
            productos: []
        };
        this.productoTemp = this.getProductoTempVacio();
        this.productoSeleccionado = null;
        this.showModalNueva = true;
    }

    cerrarModalNueva(): void {
        this.showModalNueva = false;
    }

    onNuevoToggle(): void {
        this.productoTemp.id_producto = null;
        this.productoTemp.nombre_producto_nuevo = '';
        this.productoTemp.precio_venta_sugerido = 0;
        this.productoSeleccionado = null;
    }

    onProductoSeleccionado(producto: Producto | null): void {
        this.productoTemp.id_producto = producto ? producto.id_producto : null;
    }

    agregarProducto(): void {
        const t = this.productoTemp;

        if (t.es_nuevo) {
            if (!t.nombre_producto_nuevo?.trim() || t.cantidad <= 0 || t.valor_paquete <= 0) return;
        } else {
            if (!t.id_producto || t.cantidad <= 0 || t.valor_paquete <= 0) return;
            const yaExiste = this.nuevaSolicitud.productos.some(p => p.id_producto === t.id_producto);
            if (yaExiste) {
                this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Este producto ya fue agregado.' });
                return;
            }
        }

        const detalle: DetalleSolicitudPayload = {
            id_producto: t.es_nuevo ? null : t.id_producto,
            nombre_producto_nuevo: t.es_nuevo ? t.nombre_producto_nuevo : undefined,
            precio_venta_sugerido: t.es_nuevo ? t.precio_venta_sugerido : undefined,
            cantidad: t.cantidad,
            valor_paquete: t.valor_paquete,
            precio_unitario: t.precio_unitario,
        };

        this.nuevaSolicitud.productos.push(detalle);
        this.productoTemp = this.getProductoTempVacio();
        this.productoSeleccionado = null;
    }

    quitarProducto(index: number): void {
        this.nuevaSolicitud.productos.splice(index, 1);
    }

    getNombreProductoEnLista(p: DetalleSolicitudPayload): string {
        if (p.id_producto) {
            const prod = this.productos.find(x => x.id_producto === p.id_producto);
            return prod ? prod.nombre_producto : `ID: ${p.id_producto}`;
        }
        return p.nombre_producto_nuevo ?? '—';
    }

    get totalSolicitud(): number {
        return this.nuevaSolicitud.productos.reduce((acc, p) => acc + (p.valor_paquete ?? 0), 0);
    }

    formValido(): boolean {
        return !!(this.nuevaSolicitud.fecha && this.nuevaSolicitud.proveedor?.trim() && this.nuevaSolicitud.productos.length > 0);
    }

    guardarSolicitud(): void {
        if (!this.formValido()) return;
        this.guardando = true;
        this.solicitudesService.registrarSolicitud(this.nuevaSolicitud).subscribe({
            next: (res) => {
                this.guardando = false;
                if (res.p_estado === 1) {
                    this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Solicitud registrada correctamente.' });
                    this.cerrarModalNueva();
                    this.cargarSolicitudes();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: res.p_mensaje });
                }
            },
            error: () => {
                this.guardando = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar la solicitud.' });
            }
        });
    }

    // ── Modal detalle ──────────────────────────────────────────────────────────

    verDetalle(solicitud: SolicitudAgrupada): void {
        this.solicitudSeleccionada = solicitud;
        this.showModalDetalle = true;
    }

    cerrarModalDetalle(): void {
        this.showModalDetalle = false;
        this.solicitudSeleccionada = null;
    }

    // ── Aprobar ────────────────────────────────────────────────────────────────

    confirmarAprobar(solicitud: SolicitudAgrupada): void {
        this.solicitudAGestionar = solicitud;
        this.showModalAprobar = true;
    }

    aprobarSolicitud(): void {
        if (!this.solicitudAGestionar) return;
        this.aprobando = true;
        this.solicitudesService.aprobarSolicitud(this.solicitudAGestionar.id_solicitud).subscribe({
            next: (res) => {
                this.aprobando = false;
                this.showModalAprobar = false;
                if (res.p_estado === 1) {
                    this.messageService.add({ severity: 'success', summary: '¡Aprobada!', detail: res.p_mensaje, life: 6000 });
                    this.cargarSolicitudes();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: res.p_mensaje });
                }
                this.solicitudAGestionar = null;
            },
            error: () => {
                this.aprobando = false;
                this.showModalAprobar = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo aprobar la solicitud.' });
                this.solicitudAGestionar = null;
            }
        });
    }

    // ── Rechazar ───────────────────────────────────────────────────────────────

    confirmarRechazar(solicitud: SolicitudAgrupada): void {
        this.solicitudAGestionar = solicitud;
        this.showModalRechazar = true;
    }

    rechazarSolicitud(): void {
        if (!this.solicitudAGestionar) return;
        this.rechazando = true;
        this.solicitudesService.rechazarSolicitud(this.solicitudAGestionar.id_solicitud).subscribe({
            next: (res) => {
                this.rechazando = false;
                this.showModalRechazar = false;
                if (res.p_estado === 1) {
                    this.messageService.add({ severity: 'warn', summary: 'Rechazada', detail: 'La solicitud fue rechazada.' });
                    this.cargarSolicitudes();
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: res.p_mensaje });
                }
                this.solicitudAGestionar = null;
            },
            error: () => {
                this.rechazando = false;
                this.showModalRechazar = false;
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo rechazar la solicitud.' });
                this.solicitudAGestionar = null;
            }
        });
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    getSeveridadEstado(estado: string): 'warn' | 'success' | 'danger' | 'secondary' {
        if (estado === 'PENDIENTE') return 'warn';
        if (estado === 'APROBADA')  return 'success';
        if (estado === 'RECHAZADA') return 'danger';
        return 'secondary';
    }
}
