import { Component, ElementRef, OnInit, ViewChild, HostListener } from '@angular/core';
import { ConfirmationService, MenuItem, MenuItemCommandEvent, MessageService } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { Configurator } from '../configurator';
import { LayoutService } from '../../service/layout.service';
import { Menu } from 'primeng/menu';
import { AuthService } from '@/services/auth-service';
import { Usuarios } from 'src/entidades/Usuarios';
import { catchError, of, tap } from 'rxjs';
import { Toast } from "primeng/toast";
import { Dialog } from 'primeng/dialog';
import { MenuBar } from "@/components/menu-bar/menu-bar";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from "primeng/button";
import { Password } from "primeng/password";
import { ConfirmDialog } from "primeng/confirmdialog";
import { NotificacionesService } from '@/services/notificaciones.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, Menu, Toast, Dialog, ReactiveFormsModule, Button, Password, ConfirmDialog],
    templateUrl: './topbar.html',
    providers: [MessageService, ConfirmationService],
    styleUrl: './topbar.scss'

})
export class Topbar implements OnInit {
    items!: MenuItem[];
    isVisible: boolean = false;
    form: FormGroup;
    usuario_name : string = '';
    with_screen: number = window.innerWidth;
    notifPanelOpen: boolean = false;

    @ViewChild('notifWrapperEl') notifWrapperEl!: ElementRef;

    get userName(): string {
        const u = this.authService.getUsuario;
        return u?.USERNAME || 'Usuario';
    }

    get isDark(): boolean {
        return this.layoutService.isDarkTheme();
    }


    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private router: Router,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder,
        public notifService: NotificacionesService,
    ) {
        this.form = this.fb.group({
            p_password_old: ['', [Validators.required,]],
            p_password_new: ['', [Validators.required, Validators.minLength(8)]],
        })

    }

    ngOnInit(): void {
        const u = this.authService.getUsuario;
        
        this.usuario_name = u?.USERNAME || 'Usuario';
        this.items = [
            {
                label: 'Opciones',
                items: [
                    {
                        label: "Cambiar contraseña",
                        icon: 'pi pi-fw pi-pencil',
                        command: () => {
                            this.isVisible = true;
                        }
                    },
                    {
                        label: 'Cerrar Session',
                        icon: 'pi pi-fw pi-sign-out',
                        command: () => {
                            this.onClickLogout();
                        }

                    }
                ]
            }
        ]
    }

    onClickLogout(): void {
        this.confirmationService.confirm({
            message: '¿Está seguro de cerrar sesión??',
            header: 'Confirmation',
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'Cancelar',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'Aceptar',
            },
            accept: () => {
                this.logout();
            },
        });
    }

    logout(): void {
        this.router.navigate(["login"]);

        // this.authService.logout().pipe(
        //     tap(res => {
        //         this.messageService.clear();

        //         if (res.p_estado === 0) {
        //             this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cerrar sesión' });
        //             return;
        //         }

        //         this.authService.setToken = "";
        //         this.authService.setUsuario = new Usuarios();
        //         sessionStorage.clear();
        //         this.router.navigate(["login"]);
        //     }),
        //     catchError(err => {
        //         this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cerrar sesión' });
        //         return of(null);
        //     })
        // ).subscribe();
    }

    cambiarPassword(): void {
        if (!this.form.valid) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ingresar contraseñas validas' })
            this.closeDialog()
            return;
        }
        const dt = {
            ...this.form.value,
            p_username: this.authService.getUsuario.USERNAME
        }
        console.log(dt)
        this.authService.cambiarPassword(dt).subscribe(res => {
            console.log(res)
            this.messageService.clear();
            if (res.p_estado !== 0) {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contraseña actualizada' })
                this.closeDialog()
            } else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al actualizar la contraseña' })
                this.closeDialog()
            }
        })
    }

    closeDialog(): void {
        this.isVisible = false;
        this.form.reset();
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    toggleNotifPanel(): void {
        this.notifPanelOpen = !this.notifPanelOpen;
    }

    marcarTodasLeidas(): void {
        this.notifService.marcarTodasLeidas();
    }

    limpiarNotificaciones(): void {
        this.notifService.limpiar();
    }

    nombreCliente(n: { nombres: string; apellidos: string }): string {
        return (n.nombres + ' ' + n.apellidos).trim() || 'Cliente';
    }

    tiempoTranscurrido(fecha: string): string {
        const diff = Date.now() - new Date(fecha).getTime();
        const min = Math.floor(diff / 60000);
        if (min < 1) return 'Ahora';
        if (min < 60) return `hace ${min} min`;
        const h = Math.floor(min / 60);
        if (h < 24) return `hace ${h}h`;
        const d = Math.floor(h / 24);
        return `hace ${d}d`;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: Event): void {
        if (this.notifWrapperEl && !this.notifWrapperEl.nativeElement.contains(event.target)) {
            this.notifPanelOpen = false;
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.with_screen = event.target.innerWidth;
    }
}
