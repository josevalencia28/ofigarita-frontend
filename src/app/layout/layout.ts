import { Component, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { Topbar } from './components/topbar/topbar';
import { Sidebar } from './components/sidebar/sidebar';
import { Footer } from './components/footer/footer';
import { LayoutService } from '../layout/service/layout.service';
import { VentasService } from '@/pages/service/ventas.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '@/services/auth-service';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, Topbar, RouterModule, Footer, Sidebar, ToastModule],
    templateUrl: `./layout.html`
})
export class Layout implements OnDestroy, OnInit {
    overlayMenuOpenSubscription: Subscription;
    private sseSubscription?: Subscription;

    menuOutsideClickListener: any;
    with_screen:number = window.innerWidth;


    @ViewChild(Sidebar) appSidebar!: Sidebar;

    @ViewChild(Topbar) appTopBar!: Topbar;


    constructor(
        public layoutService: LayoutService,
        public renderer: Renderer2,
        public router: Router,
        private ventasService: VentasService,
        private messageService: MessageService,
        private authService: AuthService,
    ) {
        this.overlayMenuOpenSubscription = this.layoutService.overlayOpen$.subscribe(() => {
            if (!this.menuOutsideClickListener) {
                this.menuOutsideClickListener = this.renderer.listen('document', 'click', (event) => {
                    if (this.isOutsideClicked(event)) {
                        this.hideMenu();
                    }
                });
            }

            if (this.layoutService.layoutState().staticMenuMobileActive) {
                this.blockBodyScroll();
            }
        });

        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            this.hideMenu();
        });
    }

    isOutsideClicked(event: MouseEvent) {
        const sidebarEl = document.querySelector('.layout-sidebar');
        const topbarEl = document.querySelector('.layout-menu-button');
        const eventTarget = event.target as Node;

        return !(sidebarEl?.isSameNode(eventTarget) || sidebarEl?.contains(eventTarget) || topbarEl?.isSameNode(eventTarget) || topbarEl?.contains(eventTarget));
    }

    hideMenu() {
        this.layoutService.layoutState.update((prev) => ({ ...prev, overlayMenuActive: false, staticMenuMobileActive: false, menuHoverActive: false }));
        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
            this.menuOutsideClickListener = null;
        }
        this.unblockBodyScroll();
    }

    blockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.add('blocked-scroll');
        } else {
            document.body.className += ' blocked-scroll';
        }
    }

    unblockBodyScroll(): void {
        if (document.body.classList) {
            document.body.classList.remove('blocked-scroll');
        } else {
            document.body.className = document.body.className.replace(new RegExp('(^|\\b)' + 'blocked-scroll'.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    get containerClass() {
        return {
            'layout-overlay': this.layoutService.layoutConfig().menuMode === 'overlay',
            'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
            'layout-static-inactive': this.layoutService.layoutState().staticMenuDesktopInactive && this.layoutService.layoutConfig().menuMode === 'static',
            'layout-overlay-active': this.layoutService.layoutState().overlayMenuActive,
            'layout-mobile-active': this.layoutService.layoutState().staticMenuMobileActive
        };
    }

    ngOnDestroy() {
        if (this.overlayMenuOpenSubscription) {
            this.overlayMenuOpenSubscription.unsubscribe();
        }

        if (this.menuOutsideClickListener) {
            this.menuOutsideClickListener();
        }

        this.sseSubscription?.unsubscribe();
    }

    ngOnInit(): void {
        this.layoutService.layoutConfig.update((state) => ({ ...state, primary: 'rose' }));
        this.solicitarPermisoNotificaciones();
        this.conectarNotificacionesVentas();
    }

    private esAdministrador(): boolean {
        const usuario = this.authService.getUsuario;
        // Ajusta el ID de rol si tu rol de administrador es distinto de 1
        return Array.isArray(usuario.ROL) && usuario.ROL.includes(1);
    }

    private async solicitarPermisoNotificaciones(): Promise<void> {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return;
        }

        if (Notification.permission === 'default') {
            try {
                await Notification.requestPermission();
            } catch {
                // Ignorar errores de solicitud de permiso
            }
        }
    }

    private mostrarNotificacionEscritorio(titulo: string, cuerpo: string): void {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            return;
        }

        if (Notification.permission !== 'granted') {
            return;
        }

        new Notification(titulo, {
            body: cuerpo,
        });
    }

    conectarNotificacionesVentas(): void {
        if (!this.esAdministrador()) {
            return;
        }

        this.sseSubscription = this.ventasService.streamNuevasVentas().subscribe({
            next: (venta: any) => {
                const cliente = `${venta.nombres ?? ''} ${venta.apellidos ?? ''}`.trim() || 'Cliente';
                const total = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(venta.total);
                const detalle = `${cliente} — ${total}`;

                this.messageService.add({
                    severity: 'success',
                    summary: '¡Nueva compra!',
                    detail: `${cliente} — ${total}`,
                    life: 10000,
                });

                this.mostrarNotificacionEscritorio('¡Nueva compra!', detalle);
            },
        });
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.with_screen = event.target.innerWidth;
    }
}
