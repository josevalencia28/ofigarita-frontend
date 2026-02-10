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
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

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
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './actualizar-cartera.html',
  styleUrl: './actualizar-cartera.scss'
})
export class ActualizarCartera {
  loading: boolean = true;
  carteraCliente: any[] = [];
  expandedRows = {};

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private carteraClienteService: CarteraClienteService
  ) { }

  ngOnInit(): void {
    this.getCarteraCliente();
  }

  getCarteraCliente(): void {
    this.carteraCliente = [];
    this.carteraClienteService.getUltimasVentas().subscribe({
      next: (carteraCliente: carteraClienteResponse) => {
        console.log(carteraCliente);

        this.carteraCliente = carteraCliente.data.map((item: CarteraClienteData, index: number) => {
          const clienteData = item.cartera_json;

          let fechaMasReciente = '';
          if (clienteData.ventas && clienteData.ventas.length > 0) {
            fechaMasReciente = clienteData.ventas[0].fecha_venta;
          }

          const listaProductos = clienteData.ventas
            ? clienteData.ventas.flatMap(v =>
              v.detalle ? v.detalle.map(d => d.producto) : []
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
        console.log('Cartera procesada:', this.carteraCliente);
      },
      error: (error: any) => {
        this.loading = false;
        console.error(error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la cartera'
        });
      }
    });
  }

  actualizarPagoTotal(numero_id: number, tipo_pago: string): void {
    const tipoPagoNombre = tipo_pago === 'EF' ? 'EFECTIVO' : 'NEQUI';

    this.confirmationService.confirm({
      message: `¿Está seguro de actualizar TODAS las ventas a crédito de este cliente a ${tipoPagoNombre}?`,
      header: 'Confirmación de Pago Total',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, actualizar todo',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.loading = true;
        this.carteraClienteService.actualizarPagoTotal(numero_id, tipo_pago).subscribe({
          next: (response: any) => {
            console.log(response);

            if (response.p_estado === 1) {
              this.messageService.add({
                severity: 'success',
                summary: 'Éxito',
                detail: response.p_mensaje || 'Cartera actualizada correctamente',
                life: 5000
              });
              this.getCarteraCliente();
            } else {
              this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: response.p_mensaje || 'No se pudo actualizar la cartera',
                life: 5000
              });
              this.loading = false;
            }
          },
          error: (error: any) => {
            console.error(error);
            this.loading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.error?.p_mensaje || 'Error al actualizar la cartera',
              life: 5000
            });
          }
        });
      }
    });
  }

  actualizarTipoPago(id_venta: number, tipo_pago: string): void {
    console.log(id_venta, tipo_pago);

    this.carteraClienteService.actualizarTipoPago(id_venta, tipo_pago).subscribe({
      next: (response: any) => {
        console.log(response);

        if (response.p_estado === 1) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: response.p_mensaje || 'Tipo de pago actualizado correctamente',
            life: 3000
          });
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
        console.error(error);
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