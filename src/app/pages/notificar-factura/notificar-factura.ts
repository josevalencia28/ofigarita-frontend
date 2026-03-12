import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Toast } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
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
    Toast,
    TagModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
  ],
  providers: [MessageService],
  templateUrl: './notificar-factura.html',
  styleUrl: './notificar-factura.scss'
})
export class NotificarFactura implements OnInit {
  @ViewChild('dt') dt!: Table;

  clientes: ClienteFactura[] = [];
  loading = false;
  enviandoPuntual: { [key: string]: boolean } = {};
  enviandoMasivo = false;

  // Modal: envío puntual
  showConfirmPuntual = false;
  clienteSeleccionado: ClienteFactura | null = null;

  // Modal: envío masivo
  showConfirmMasivo = false;

  constructor(
    private notificarService: NotificarFacturaService,
    private messageService: MessageService,
  ) {}

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

  // ── Envío puntual ───────────────────────────────────────────────────────────

  confirmarEnvioPuntual(cliente: ClienteFactura): void {
    this.clienteSeleccionado = cliente;
    this.showConfirmPuntual = true;
  }

  ejecutarEnvioPuntual(): void {
    if (!this.clienteSeleccionado) return;
    const cliente = this.clienteSeleccionado;
    const numero_id = cliente.factura_json.numero_id.toString();

    this.enviandoPuntual[numero_id] = true;
    this.showConfirmPuntual = false;
    this.messageService.clear();

    this.notificarService.enviarNotificacionPuntual(numero_id).subscribe({
      next: (response) => {
        if (response.p_estado === 1) {
          this.messageService.add({
            severity: 'success',
            summary: 'Factura enviada',
            detail: response.p_mensaje,
            life: 4000
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error al enviar',
            detail: response.p_mensaje,
            life: 5000
          });
        }
        this.enviandoPuntual[numero_id] = false;
        this.clienteSeleccionado = null;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al enviar la notificación: ' + error.message,
          life: 5000
        });
        this.enviandoPuntual[numero_id] = false;
        this.clienteSeleccionado = null;
      }
    });
  }

  // ── Envío masivo ────────────────────────────────────────────────────────────

  confirmarEnvioMasivo(): void {
    this.showConfirmMasivo = true;
  }

  ejecutarEnvioMasivo(): void {
    this.enviandoMasivo = true;
    this.showConfirmMasivo = false;
    this.messageService.clear();

    this.notificarService.enviarNotificacionMasiva().subscribe({
      next: (response) => {
        if (response.p_estado === 1 && response.resultados) {
          this.messageService.add({
            severity: 'success',
            summary: 'Envío masivo completado',
            detail: `${response.resultados.exitosos} enviados · ${response.resultados.fallidos} fallidos`,
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

  // ── Helpers ─────────────────────────────────────────────────────────────────

  isEnviandoPuntual(numero_id: number): boolean {
    return this.enviandoPuntual[numero_id.toString()] || false;
  }

  onGlobalFilter(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.dt.filterGlobal(inputElement.value, 'contains');
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CO');
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }
}
