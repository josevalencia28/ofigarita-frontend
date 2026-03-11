import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { VentasService } from '@/pages/service/ventas.service';

@Component({
    selector: 'app-historico-ventas',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        DatePickerModule,
        TagModule,
    ],
    templateUrl: './historico-ventas.html',
    styleUrl: './historico-ventas.scss',
})
export class HistoricoVentas implements OnInit {
    ventas: any[] = [];
    totalizadores: any = { total_registros: 0, suma_total: 0, por_medio_pago: {} };
    loading = false;

    // Filtros
    fechaDesde: Date | null = null;
    fechaHasta: Date | null = null;
    mesSeleccionado: number | null = null;
    anioSeleccionado: number | null = null;
    clienteFiltro = '';
    productoFiltro = '';
    tipoPagoFiltro: string | null = null;
    expandedRows: { [key: string]: boolean } = {};

    mesesOptions = [
        { label: 'Enero', value: 1 },
        { label: 'Febrero', value: 2 },
        { label: 'Marzo', value: 3 },
        { label: 'Abril', value: 4 },
        { label: 'Mayo', value: 5 },
        { label: 'Junio', value: 6 },
        { label: 'Julio', value: 7 },
        { label: 'Agosto', value: 8 },
        { label: 'Septiembre', value: 9 },
        { label: 'Octubre', value: 10 },
        { label: 'Noviembre', value: 11 },
        { label: 'Diciembre', value: 12 },
    ];

    tiposPagoOptions = [
        { label: 'Efectivo', value: 'EF' },
        { label: 'Crédito', value: 'CR' },
        { label: 'Nequi', value: 'NE' },
        { label: 'Transferencia', value: 'TR' },
    ];

    aniosOptions: { label: string; value: number }[] = [];

    constructor(private ventasService: VentasService) {}

    ngOnInit() {
        const currentYear = new Date().getFullYear();
        for (let y = currentYear; y >= 2020; y--) {
            this.aniosOptions.push({ label: y.toString(), value: y });
        }
        this.buscar();
    }

    buscar() {
        this.loading = true;
        const filters: Record<string, any> = {};

        if (this.fechaDesde) filters['fecha_desde'] = this.formatDate(this.fechaDesde);
        if (this.fechaHasta) filters['fecha_hasta'] = this.formatDate(this.fechaHasta);
        if (this.mesSeleccionado) filters['mes'] = this.mesSeleccionado;
        if (this.anioSeleccionado) filters['año'] = this.anioSeleccionado;
        if (this.clienteFiltro.trim()) filters['cliente'] = this.clienteFiltro.trim();
        if (this.productoFiltro.trim()) filters['producto'] = this.productoFiltro.trim();
        if (this.tipoPagoFiltro) filters['tipo_pago'] = this.tipoPagoFiltro;

        this.ventasService.getHistoricoVentas(filters).subscribe({
            next: (res) => {
                this.ventas = res.p_estado === 1 ? res.data : [];
                this.totalizadores = res.p_estado === 1
                    ? res.totalizadores
                    : { total_registros: 0, suma_total: 0, por_medio_pago: {} };
                this.loading = false;
            },
            error: () => { this.loading = false; },
        });
    }

    toggleRow(venta: any): void {
        const key = String(venta.id_venta);
        if (this.expandedRows[key]) {
            const { [key]: _, ...rest } = this.expandedRows;
            this.expandedRows = rest;
        } else {
            this.expandedRows = { ...this.expandedRows, [key]: true };
        }
    }

    limpiar() {
        this.fechaDesde = null;
        this.fechaHasta = null;
        this.mesSeleccionado = null;
        this.anioSeleccionado = null;
        this.clienteFiltro = '';
        this.productoFiltro = '';
        this.tipoPagoFiltro = null;
        this.buscar();
    }

    private formatDate(date: Date): string {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }

    getMedioPagoSeverity(mp: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
            Efectivo: 'success',
            Crédito: 'warn',
            Nequi: 'info',
            Transferencia: 'secondary',
        };
        return map[mp] ?? 'secondary';
    }

    getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
            PAGADA: 'success',
            PENDIENTE: 'warn',
            CANCELADA: 'danger',
        };
        return map[estado] ?? 'secondary';
    }

    get medioPagoEntries(): { key: string; value: { cantidad: number; total: number } }[] {
        return Object.entries(this.totalizadores.por_medio_pago ?? {}).map(([key, value]) => ({
            key,
            value: value as { cantidad: number; total: number },
        }));
    }

    exportarExcel() {
        if (!this.ventas.length) return;

        const BOM = '\uFEFF';
        const sep = ';';

        const headers = [
            'ID Venta', 'Fecha', 'Cliente', 'Cédula', 'Correo',
            'Medio de Pago', 'Estado', 'Total (COP)',
            'Detalle Productos',
        ];

        const dataRows = this.ventas.map(v => {
            const detalle = (v.detalle_productos ?? [])
                .map((d: any) => `${d.producto} x${d.cantidad} @ $${d.precio_unitario}`)
                .join(' | ');
            return [
                v.id_venta,
                v.fecha_formateada,
                v.nombre_cliente,
                v.numero_id,
                v.correo_cliente ?? '',
                v.medio_pago,
                v.estado,
                v.total,
                detalle,
            ];
        });

        const totalRows: any[][] = [
            [],
            ['TOTALIZADORES'],
            ['Total ventas', this.totalizadores.total_registros],
            ['Monto total', this.totalizadores.suma_total],
            ...this.medioPagoEntries.flatMap(e => [
                [`${e.key} — Cantidad`, e.value.cantidad],
                [`${e.key} — Total`, e.value.total],
            ]),
        ];

        const escape = (c: any) => `"${String(c ?? '').replace(/"/g, '""')}"`;
        const csv = BOM + [headers, ...dataRows, ...totalRows]
            .map(row => row.map(escape).join(sep))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historico_ventas_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}
