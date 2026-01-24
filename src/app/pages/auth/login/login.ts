import { AuthService } from '@/services/auth-service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { tap } from 'rxjs';
import { Toast } from "primeng/toast";

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, Toast],
    templateUrl: `./login.html`,
    providers: [MessageService],
})
export class Login {
    user: string = 'jvalencia';

    pass: string = 'ClaveSegura123';

    checked: boolean = false;

    constructor(
        private router: Router,
        private authService: AuthService,
        private messageService: MessageService
    ) { }

    login(): void {

        if (!this.pass || !this.user) {
            this.messageService.clear();
            this.messageService.add({ severity: 'error', summary: 'Campos requeridos', detail: 'Verificar todos los campos' });
            this.checked = true;

            return;
        }

        const params = {
            "username": this.user,
            "password": this.pass
        }
        console.log(params);
        this.authService.login(params).pipe(tap(res => {
            if (res.p_estado === 0) {
                this.messageService.clear();
                this.messageService.add({ severity: 'error', summary: 'Inicio de sesión fallido', detail: 'Usuario y/o contraseña incorrectos' });
                this.checked = true;

                return;
            }
            this.authService.guardarUsuario(res.token);
            this.authService.guardarToken(res.token);

            this.router.navigate(["layout/dashboard"]);
        })).subscribe();
    }
}
