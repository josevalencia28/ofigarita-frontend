import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ClienteFactura, NotificarFacturaService } from '../service/notificar-factura.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-notificar-factura',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './notificar-factura.html',
  styleUrl: './notificar-factura.scss'
})
export class NotificarFactura {
  @ViewChild('dt') dt!: Table;

  clientes: ClienteFactura[] = [];
  loading: boolean = false;
  enviandoPuntual: { [key: string]: boolean } = {};
  enviandoMasivo: boolean = false;

  constructor(
    private notificarService: NotificarFacturaService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.loading = true;
    this.messageService.clear();
    this.notificarService.getClientesNotificar().subscribe({
      next: (response) => {
        if (response.p_estado === 1 && response.result) {
          this.clientes = response.result;
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response.p_mensaje || 'No se pudieron cargar los clientes',
            life: 5000
          });
        }
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los clientes: ' + error.message,
          life: 5000
        });
        this.loading = false;
      }
    });
  }

  enviarNotificacionPuntual(cliente: ClienteFactura): void {
    const numero_id = cliente.factura_json.numero_id.toString();
    this.messageService.clear();
    this.confirmationService.confirm({
      message: `¿Desea enviar la factura ${cliente.factura_json.nro_factura} a ${cliente.factura_json.nombre}?`,
      header: 'Confirmar Envío',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Enviar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.enviandoPuntual[numero_id] = true;

        this.notificarService.enviarNotificacionPuntual(numero_id).subscribe({
          next: (response) => {
            if (response.p_estado === 1) {
              this.messageService.add({
                severity: 'success',
                summary: 'Factura Enviada',
                detail: response.p_mensaje,
                life: 4000
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error al Enviar',
                detail: response.p_mensaje,
                life: 5000
              });
            }
            this.enviandoPuntual[numero_id] = false;
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al enviar la notificación: ' + error.message,
              life: 5000
            });
            this.enviandoPuntual[numero_id] = false;
          }
        });
      }
    });
  }

  enviarNotificacionMasiva(): void {
    this.messageService.clear();
    this.confirmationService.confirm({
      message: `¿Desea enviar facturas a ${this.clientes.length} clientes?`,
      header: 'Confirmar Envío Masivo',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Enviar a Todos',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.enviandoMasivo = true;

        this.notificarService.enviarNotificacionMasiva().subscribe({
          next: (response) => {
            if (response.p_estado === 1 && response.resultados) {
              this.messageService.add({
                severity: 'success',
                summary: 'Envío Masivo Completado',
                detail: `${response.resultados.exitosos} enviados, ${response.resultados.fallidos} fallidos`,
                life: 6000
              });
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: response.p_mensaje,
                life: 5000
              });
            }
            this.enviandoMasivo = false;
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error en el envío masivo: ' + error.message,
              life: 5000
            });
            this.enviandoMasivo = false;
          }
        });
      }
    });
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO');
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(precio);
  }

  isEnviandoPuntual(numero_id: number): boolean {
    return this.enviandoPuntual[numero_id.toString()] || false;
  }


  onGlobalFilter(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.dt.filterGlobal(inputElement.value, 'contains');
  }
}