import { Injectable, signal, computed } from '@angular/core';

export interface NotificacionItem {
    nombre_producto: string;
    cantidad: number;
}

export interface Notificacion {
    id: string;
    nombres: string;
    apellidos: string;
    total: number;
    id_venta: number;
    fecha: string;
    leida: boolean;
    items: NotificacionItem[];
}

const STORAGE_KEY = 'ofigarita_notificaciones';
const MAX_NOTIFICACIONES = 100;

@Injectable({ providedIn: 'root' })
export class NotificacionesService {

    private _notificaciones = signal<Notificacion[]>(this.cargarDeStorage());

    readonly notificaciones = this._notificaciones.asReadonly();
    readonly noLeidas = computed(() => this._notificaciones().filter(n => !n.leida).length);

    agregar(venta: { nombres: string; apellidos: string; total: number; id_venta: number; items?: NotificacionItem[] }): void {
        const nueva: Notificacion = {
            id: Date.now().toString(),
            nombres: venta.nombres ?? '',
            apellidos: venta.apellidos ?? '',
            total: venta.total,
            id_venta: venta.id_venta,
            fecha: new Date().toISOString(),
            leida: false,
            items: venta.items ?? [],
        };
        const actualizadas = [nueva, ...this._notificaciones()].slice(0, MAX_NOTIFICACIONES);
        this._notificaciones.set(actualizadas);
        this.guardarEnStorage(actualizadas);
    }

    marcarTodasLeidas(): void {
        const actualizadas = this._notificaciones().map(n => ({ ...n, leida: true }));
        this._notificaciones.set(actualizadas);
        this.guardarEnStorage(actualizadas);
    }

    limpiar(): void {
        this._notificaciones.set([]);
        try { localStorage.removeItem(STORAGE_KEY); } catch { }
    }

    private cargarDeStorage(): Notificacion[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed: any[] = JSON.parse(raw);
            // Filtrar entradas corruptas (sin id_venta válido)
            return parsed.filter(n =>
                n && typeof n.id_venta === 'number' && n.id_venta > 0 &&
                typeof n.fecha === 'string' && n.fecha.length > 0
            );
        } catch {
            return [];
        }
    }

    private guardarEnStorage(notificaciones: Notificacion[]): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(notificaciones));
        } catch { }
    }
}
