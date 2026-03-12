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
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-actualizar-cartera',
  imports: [
    TableModule,
    CardModule,
    ButtonModule,
    CommonModule,
    RippleModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    Toast,
    DialogModule,
  ],
  templateUrl: './actualizar-cartera.html',
  styleUrl: './actualizar-cartera.scss'
})
export class ActualizarCartera {
  loading: boolean = true;
  carteraCliente: any[] = [];
  expandedRows = {};
  procesando = false;

  // Modal: pago individual
  showConfirmIndividual = false;
  pendingVentaId: number | null = null;

  // Modal: pago total
  showConfirmTotal = false;
  pendingClienteId: number | null = null;
  pendingClienteNombre: string = '';
  pendingClienteTotal: number = 0;
  pendingClienteVentas: number = 0;

  // Compartido
  pendingTipoPago: string = '';
  pendingTipoPagoNombre: string = '';

  get totalCartera(): number {
    return this.carteraCliente.reduce((s, c) => s + Number(c.total), 0);
  }
  get totalVentasCartera(): number {
    return this.carteraCliente.reduce((s, c) => s + (c.ventas?.length ?? 0), 0);
  }

  constructor(
    private messageService: MessageService,
    private carteraClienteService: CarteraClienteService
  ) { }

  ngOnInit(): void {
    this.getCarteraCliente();
  }

  getCarteraCliente(): void {
    this.carteraCliente = [];
    this.messageService.clear();
    this.carteraClienteService.getUltimasVentas().subscribe({
      next: (carteraCliente: carteraClienteResponse) => {
        this.carteraCliente = carteraCliente.data.map((item: CarteraClienteData, index: number) => {
          const clienteData = item.cartera_json;

          let fechaMasReciente = '';
          if (clienteData.ventas && clienteData.ventas.length > 0) {
            fechaMasReciente = clienteData.ventas[0].fecha_venta;
          }

          const listaProductos = clienteData.ventas
            ? clienteData.ventas.flatMap(v =>
              v.detalle ? v.detalle.map((d: any) => d.producto) : []
            ).join(' ')
            : '';

          return {
            internalId: index,
            numero_id: clienteData.numero_id,
            nombre: clienteData.nombre,
            fecha_venta: fechaMasReciente,
            total: clienteData.total,
            forma_pago: 'CRÉDITO',
            estado_venta: 'PENDIENTE',
            ventas: clienteData.ventas || [],
            listaProductos: listaProductos
          };
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la cartera'
        });
      }
    });
  }

  // ── Pago total ──────────────────────────────────────────────────────────────

  confirmarPagoTotal(cliente: any, tipo_pago: string): void {
    this.pendingClienteId       = cliente.numero_id;
    this.pendingClienteNombre   = cliente.nombre;
    this.pendingClienteTotal    = cliente.total;
    this.pendingClienteVentas   = cliente.ventas?.length ?? 0;
    this.pendingTipoPago        = tipo_pago;
    this.pendingTipoPagoNombre  = tipo_pago === 'EF' ? 'EFECTIVO' : 'NEQUI';
    this.showConfirmTotal       = true;
  }

  ejecutarPagoTotal(): void {
    if (!this.pendingClienteId) return;
    this.procesando = true;
    this.carteraClienteService.actualizarPagoTotal(this.pendingClienteId, this.pendingTipoPago).subscribe({
      next: (response: any) => {
        this.procesando = false;
        this.showConfirmTotal = false;
        if (response.p_estado === 1) {
          this.messageService.add({
            severity: 'success',
            summary: 'Cartera actualizada',
            detail: response.p_mensaje || 'Todas las ventas fueron actualizadas correctamente',
            life: 5000
          });
          this.loading = true;
          this.getCarteraCliente();
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: response.p_mensaje || 'No se pudo actualizar la cartera',
            life: 5000
          });
        }
      },
      error: (error: any) => {
        this.procesando = false;
        this.showConfirmTotal = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.p_mensaje || 'Error al actualizar la cartera',
          life: 5000
        });
      }
    });
  }

  // ── Pago individual ─────────────────────────────────────────────────────────

  confirmarPagoIndividual(id_venta: number, tipo_pago: string): void {
    this.pendingVentaId        = id_venta;
    this.pendingTipoPago       = tipo_pago;
    this.pendingTipoPagoNombre = tipo_pago === 'EF' ? 'EFECTIVO' : 'NEQUI';
    this.showConfirmIndividual = true;
  }

  ejecutarPagoIndividual(): void {
    if (!this.pendingVentaId) return;
    this.procesando = true;
    this.carteraClienteService.actualizarTipoPago(this.pendingVentaId, this.pendingTipoPago).subscribe({
      next: (response: any) => {
        this.procesando = false;
        this.showConfirmIndividual = false;
        if (response.p_estado === 1) {
          this.messageService.add({
            severity: 'success',
            summary: 'Pago registrado',
            detail: response.p_mensaje || 'Venta actualizada correctamente',
            life: 3000
          });
          this.loading = true;
          this.getCarteraCliente();
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Advertencia',
            detail: response.p_mensaje || 'No se pudo actualizar el tipo de pago',
            life: 3000
          });
        }
      },
      error: (error: any) => {
        this.procesando = false;
        this.showConfirmIndividual = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.p_mensaje || 'Error al actualizar el tipo de pago',
          life: 3000
        });
      }
    });
  }

  getDetalleConsolidado(ventas: any[]): any[] {
    if (!ventas) return [];
    const detalleMap = new Map<string, any>();
    ventas.forEach(venta => {
      if (venta.detalle) {
        venta.detalle.forEach((item: any) => {
          if (detalleMap.has(item.producto)) {
            const existing = detalleMap.get(item.producto);
            existing.cantidad += item.cantidad;
            existing.subtotal += item.subtotal;
          } else {
            detalleMap.set(item.producto, { ...item });
          }
        });
      }
    });
    return Array.from(detalleMap.values());
  }
}
