import { Component, OnInit, HostListener, ElementRef, AfterViewInit, inject } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { trigger, transition, style, animate } from '@angular/animations';
import { SelectModule } from 'primeng/select';
// PrimeNG Modules
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TiendaClienteService } from '@/pages/service/tienda.cliente.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';


interface Cliente {
    nombres: string;
    apellidos: string;
    tipo_identificacion: string;
    numero_id: number;
    telefono: number;
    correo: string;
}
interface Producto {
    id_producto: number;
    nombre_producto: string;
    precio_venta: number;
    stock: number;
    egreso: number;
    img: string;
    fcha_rgstro: string;
    estado: boolean;
}

interface CarritoItem {
    producto: Producto;
    cantidad: number;
}

interface ClienteData {
    id_sgclientes: number;
    numero_id: string;
    nombres: string;
    apellidos: string;
    correo: string;
    telefono: string,
    tipo_identificacion: string,
}

@Component({
    selector: 'app-tienda-cliente',
    standalone: true,
    templateUrl: './tienda-cliente.html',
    styleUrls: ['./tienda-cliente.scss'],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        HttpClientModule,
        InputTextModule,
        ButtonModule,
        ProgressSpinnerModule,
        TooltipModule,
        ToastModule,
        DialogModule,
        SelectModule,
        ReactiveFormsModule
    ],
    providers: [MessageService],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ]),
        trigger('slideIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateX(-20px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
            ])
        ])
    ]
})
export class TiendaClienteComponent implements OnInit, AfterViewInit {
    productos: Producto[] = [];
    carrito: CarritoItem[] = [];
    busqueda: string = '';
    loading: boolean = false;
    mobileMenuOpen: boolean = false;
    mobileCartOpen: boolean = false;
    imgBaseUrl = '';
    tipoPago: string = ''
    // Modal de compra
    mostrarModalCompra: boolean = false;
    cedula: string = '';
    token: string = '';
    clienteVerificado: boolean = false;
    clienteData: ClienteData | null = null;
    verificandoCliente: boolean = false;
    enviandoToken: boolean = false;
    procesandoCompra: boolean = false;
    tokenEnviado: boolean = false;
    opcionesPago = [
        { label: 'Efectivo', value: 'EF' },
        { label: 'Crédito', value: 'CR' },
        //{ label: 'Transferencia', value: 'TR' }
        // { label: 'Tarjeta Débito', value: 'TD' }
    ];
    guardando = false;
    form: FormGroup;
    mostrarModalRegistro: boolean = false;

    mostrarModalEstadoCuenta: boolean = false;
    cedulaEstadoCuenta: string = '';
    consultandoEstado: boolean = false;
    estadoCuentaData: any = null;
    isScrolled: boolean = false;

    tiposIdentificacion = [
        { label: 'Cédula de Ciudadanía', value: 'CC' },
        { label: 'Cédula de Extranjería', value: 'CE' },
        { label: 'Pasaporte', value: 'PA' },
        { label: 'NIT', value: 'NIT' }
    ]

    //       private fb = inject(FormBuilder);
    //   private dialogRef = inject(DynamicDialogRef);
    //   private config = inject(DynamicDialogConfig);

    constructor(
        private fb: FormBuilder,

        private http: HttpClient,
        private messageService: MessageService,
        private tiendaClienteService: TiendaClienteService,
        private el: ElementRef
    ) {
        this.form = this.fb.group({
            tipo_identificacion: ['', Validators.required],
            numero_id: ['', [
                Validators.required,
                Validators.pattern(/^[0-9]+$/),
                Validators.minLength(6),
                Validators.maxLength(15)
            ]],
            nombres: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            apellidos: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(100)
            ]],
            correo: ['', [
                Validators.required,
                Validators.email,
                Validators.maxLength(100)
            ]],
            telefono: ['', [
                Validators.required,
                Validators.pattern(/^[0-9]+$/),
                Validators.minLength(7),
                Validators.maxLength(10)
            ]]
        });
    }

    ngOnInit() {
        this.cargarProductos();
        this.cargarCarritoLocalStorage();
    }

    ngAfterViewInit() {
        // Esperar a que el DOM esté listo antes de agregar el listener
        setTimeout(() => {
            this.setupScrollListener();
        }, 0);
    }


    setupScrollListener() {
        const contenidoPrincipal = this.el.nativeElement.querySelector('.contenido-principal');
        if (contenidoPrincipal) {
            let ticking = false;
            contenidoPrincipal.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.checkScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });
        }
    }

    checkScroll() {
        const contenidoPrincipal = this.el.nativeElement.querySelector('.contenido-principal');
        if (contenidoPrincipal) {
            const scrollTop = contenidoPrincipal.scrollTop;
            // Aumentar el threshold para evitar parpadeos al inicio
            this.isScrolled = scrollTop > 50;
        }
    }
    abrirModalEstadoCuenta() {
        this.mostrarModalEstadoCuenta = true;
        this.cedulaEstadoCuenta = '';
        this.estadoCuentaData = null;
    }

    cerrarModalEstadoCuenta() {
        this.mostrarModalEstadoCuenta = false;
        this.cedulaEstadoCuenta = '';
        this.estadoCuentaData = null;
    }
    obtenerNombreMetodoPago(): string {
        const metodo = this.opcionesPago.find(op => op.value === this.tipoPago);
        return metodo ? metodo.label : this.tipoPago;
    }
    cargarProductos() {
        this.loading = true;
        this.tiendaClienteService.getProductos().subscribe({
            next: (response) => {
                if (response.p_estado === 1) {
                    this.productos = response.data.filter((p: Producto) => p.estado && p.stock > 0);
                }
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al cargar productos:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron cargar los productos'
                });
                this.loading = false;
            }
        });
    }

    get productosFiltrados(): Producto[] {
        if (!this.busqueda) return this.productos;

        const termino = this.busqueda.toLowerCase().trim();
        return this.productos.filter(p =>
            p.nombre_producto.toLowerCase().includes(termino)
        );
    }

    getImagenProducto(img: string): string {
        if (img.startsWith('http://') || img.startsWith('https://')) {
            return img;
        }
        return `${this.imgBaseUrl}${img}`;
    }

    agregarAlCarrito(producto: Producto) {
        const itemExistente = this.carrito.find(item =>
            item.producto.id_producto === producto.id_producto
        );

        if (itemExistente) {
            if (itemExistente.cantidad < producto.stock) {
                itemExistente.cantidad++;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Producto actualizado',
                    detail: `Cantidad aumentada a ${itemExistente.cantidad}`,
                    life: 2000
                });
            } else {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Stock máximo',
                    detail: 'No hay más unidades disponibles',
                    life: 2000
                });
            }
        } else {
            this.carrito.push({ producto, cantidad: 1 });
            this.messageService.add({
                severity: 'success',
                summary: 'Producto agregado',
                detail: producto.nombre_producto,
                life: 2000
            });
        }

        this.guardarCarritoLocalStorage();

        if (window.innerWidth <= 992) {
            this.mobileCartOpen = true;
        }
    }

    aumentarCantidad(item: CarritoItem) {
        if (item.cantidad < item.producto.stock) {
            item.cantidad++;
            this.guardarCarritoLocalStorage();
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Stock máximo',
                detail: 'No hay más unidades disponibles',
                life: 2000
            });
        }
    }

    disminuirCantidad(item: CarritoItem) {
        if (item.cantidad > 1) {
            item.cantidad--;
            this.guardarCarritoLocalStorage();
        }
    }

    eliminarDelCarrito(item: CarritoItem) {
        const index = this.carrito.indexOf(item);
        if (index > -1) {
            this.carrito.splice(index, 1);
            this.guardarCarritoLocalStorage();
            this.messageService.add({
                severity: 'info',
                summary: 'Producto eliminado',
                detail: item.producto.nombre_producto,
                life: 2000
            });
        }
    }

    get totalCarrito(): number {
        return this.carrito.reduce((total, item) =>
            total + (item.producto.precio_venta * item.cantidad), 0
        );
    }

    get cantidadTotalItems(): number {
        return this.carrito.reduce((total, item) => total + item.cantidad, 0);
    }

    finalizarCompra() {
        if (this.carrito.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Carrito vacío',
                detail: 'Agrega productos antes de finalizar la compra',
                life: 3000
            });
            return;
        }

        // Abrir modal de compra
        this.abrirModalCompra();
    }

    abrirModalCompra() {
        this.mostrarModalCompra = true;
        this.resetearEstadosModal();
    }

    cerrarModalCompra() {
        this.mostrarModalCompra = false;
        this.resetearEstadosModal();
    }

    resetearEstadosModal() {
        this.cedula = '';
        this.token = '';
        this.clienteVerificado = false;
        this.clienteData = null;
        this.tokenEnviado = false;
    }

    verificarClientePorCedula() {
        if (!this.cedula || this.cedula.trim().length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Cédula requerida',
                detail: 'Por favor ingresa tu número de cédula',
                life: 3000
            });
            return;
        }

        if (!this.tipoPago || this.tipoPago.trim().length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Método de pago requerido',
                detail: 'Por favor selecciona un método de pago',
                life: 3000
            });
            return;
        }

        this.verificandoCliente = true;
        const params = {
            cedula: this.cedula.trim()
        };

        this.tiendaClienteService.verificarClientePorCedula(params).subscribe({
            next: (res) => {
                this.verificandoCliente = false;

                if (res.p_estado == 1 && res.existe == true) {
                    // Cliente existe
                    this.clienteVerificado = true;
                    this.clienteData = res.data;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Cliente verificado',
                        detail: `Bienvenido ${res.data.nombres} ${res.data.apellidos}`,
                        life: 3000
                    });
                    // Automáticamente iniciar proceso de envío de token
                    this.iniciarProcesoVentaEnviatoken();

                } else if (res.p_estado == 1 && res.existe == false) {
                    // Cliente no existe
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Cliente no encontrado',
                        detail: 'No existe un cliente registrado con esta cédula',
                        life: 4000
                    });
                    this.abrirModalRegistro();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al verificar el cliente',
                        life: 3000
                    });
                }
            },
            error: (error) => {
                this.verificandoCliente = false;
                console.error('Error al verificar cliente:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo verificar el cliente',
                    life: 3000
                });
            }
        });
    }

    iniciarProcesoVentaEnviatoken() {
        if (!this.clienteData) return;

        this.enviandoToken = true;
        const params = {
            cedula: this.cedula,
            correo: this.clienteData.correo,
            telefono: this.clienteData.telefono,
            tipo_identificacion: this.clienteData.tipo_identificacion,
            items: this.carrito.map(item => ({
                producto_id: Number(item.producto.id_producto),
                cantidad: Number(item.cantidad),
                precio_unitario: Number(item.producto.precio_venta),
                subtotal: Number(item.producto.precio_venta * item.cantidad)
            })),
            tipo_pago: this.tipoPago
        };


        this.tiendaClienteService.iniciarProcesoVentaEnviatoken(params).subscribe({
            next: (res) => {
                this.enviandoToken = false;
                if (res.p_estado == 1) {
                    this.tokenEnviado = true;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Token enviado',
                        detail: `Se ha enviado un código de verificación a ${this.clienteData?.correo}`,
                        life: 5000
                    });
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo enviar el token de verificación',
                        life: 3000
                    });
                }
            },
            error: (error) => {
                this.enviandoToken = false;
                console.error('Error al enviar token:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo enviar el token de verificación',
                    life: 3000
                });
            }
        });
    }

    confirmarCompraConToken() {
        if (!this.token || this.token.trim().length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Token requerido',
                detail: 'Por favor ingresa el código de verificación',
                life: 3000
            });
            return;
        }

        this.procesandoCompra = true;
        const params = {
            token: this.token.trim(),
            cedula: this.clienteData?.numero_id,
            // total: this.totalCarrito,
            // productos: this.carrito.map(item => ({
            //     id_producto: item.producto.id_producto,
            //     cantidad: item.cantidad,
            //     precio: item.producto.precio_venta
            // }))
        };

        // Aquí deberías tener un servicio para confirmar la compra
        // Por ahora simularé la respuesta
        this.tiendaClienteService.procesarVenta(params).subscribe({
            next: (res) => {
                this.procesandoCompra = false;
                if (res.p_estado == 1 && res.estadoCompra == true) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Compra exitosa',
                        detail: 'Tu pedido ha sido procesado correctamente',
                        life: 4000
                    });
                    // Limpiar carrito y cerrar modal
                    this.vaciarCarrito();
                    this.cerrarModalCompra();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Token inválido',
                        detail: 'El código de verificación no es correcto',
                        life: 3000
                    });
                }
            },
            error: (error) => {
                this.procesandoCompra = false;
                console.error('Error al confirmar compra:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo procesar la compra',
                    life: 3000
                });
            }
        });
    }



    cambiarCedula() {
        this.clienteVerificado = false;
        this.clienteData = null;
        this.token = '';
        this.tokenEnviado = false;
    }

    vaciarCarrito() {
        if (this.carrito.length === 0) return;

        this.carrito = [];
        this.guardarCarritoLocalStorage();
        this.messageService.add({
            severity: 'info',
            summary: 'Carrito vacío',
            detail: 'Se eliminaron todos los productos',
            life: 2000
        });
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        if (this.mobileMenuOpen) {
            this.mobileCartOpen = false;
        }
    }

    toggleMobileCart() {
        this.mobileCartOpen = !this.mobileCartOpen;
        if (this.mobileCartOpen) {
            this.mobileMenuOpen = false;
        }
    }

    closeMobileMenus() {
        this.mobileMenuOpen = false;
        this.mobileCartOpen = false;
    }

    private guardarCarritoLocalStorage() {
        localStorage.setItem('carritoOfigarita', JSON.stringify(this.carrito));
    }

    private cargarCarritoLocalStorage() {
        const carritoGuardado = localStorage.getItem('carritoOfigarita');
        if (carritoGuardado) {
            try {
                this.carrito = JSON.parse(carritoGuardado);
            } catch (error) {
                console.error('Error al cargar carrito:', error);
                this.carrito = [];
            }
        }
    }

    consultarEstadoCuenta() {
        if (!this.cedulaEstadoCuenta || this.cedulaEstadoCuenta.trim().length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Cédula requerida',
                detail: 'Por favor ingresa un número de cédula',
                life: 3000
            });
            return;
        }

        this.consultandoEstado = true;

        this.tiendaClienteService.estadoCuentaCliente(this.cedulaEstadoCuenta.trim()).subscribe({
            next: (response) => {
                this.consultandoEstado = false;
                if (response.p_estado === 1 && response.result && response.result.length > 0) {
                    this.estadoCuentaData = response.result[0].factura_json;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Estado de cuenta encontrado',
                        detail: 'Se encontró información de facturación',
                        life: 3000
                    });
                } else {
                    this.estadoCuentaData = null;
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Sin resultados',
                        detail: 'No se encontraron facturas para esta cédula',
                        life: 3000
                    });
                }
            },
            error: (error) => {
                this.consultandoEstado = false;
                console.error('Error al consultar estado de cuenta:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo consultar el estado de cuenta',
                    life: 3000
                });
            }
        });
    }

    formatearNumero(numero: number): string {
        return numero.toLocaleString('es-CO');
    }

    formatearFecha(fecha: string): string {
        const date = new Date(fecha + 'T00:00:00');
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    abrirModalRegistro() {
        this.mostrarModalRegistro = true;
        this.form.reset();
    }

    cerrarModalRegistro() {
        this.mostrarModalRegistro = false;
        this.form.reset();
    }

    registrarCliente() {
        if (this.form.invalid) {
            Object.keys(this.form.controls).forEach(key => {
                this.form.get(key)?.markAsTouched();
            });
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario incompleto',
                detail: 'Por favor completa todos los campos requeridos',
                life: 3000
            });
            return;
        }

        this.guardando = true;
        const datosCliente = this.form.value;
        console.log(datosCliente)

        this.tiendaClienteService.insertarCliente(datosCliente).subscribe({
            next: (response) => {
                this.guardando = false;
                if (response.p_estado === 1) {
                    // Después del registro exitoso:
                    this.clienteData = {
                        id_sgclientes: response.data.id_sgclientes,
                        numero_id: response.data.numero_id,
                        nombres: response.data.nombres,
                        apellidos: response.data.apellidos,
                        correo: response.data.correo,
                        telefono: response.data.telefono,
                        tipo_identificacion: response.data.tipo_identificacion
                    };

                    this.cedula = response.data.numero_id;
                    this.clienteVerificado = true;

                    // Automáticamente inicia el proceso de venta
                    this.iniciarProcesoVentaEnviatoken();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Cliente registrado',
                        detail: 'El cliente ha sido registrado exitosamente',
                        life: 4000
                    });
                    this.cerrarModalRegistro();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al registrar',
                        detail: response.p_mensaje || 'No se pudo registrar el cliente',
                        life: 3000
                    });
                }
            },
            error: (error) => {
                this.guardando = false;
                console.error('Error al registrar cliente:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo registrar el cliente',
                    life: 3000
                });
            }
        });
    }


    registrarClienteBoton() {
        if (this.form.invalid) {
            Object.keys(this.form.controls).forEach(key => {
                this.form.get(key)?.markAsTouched();
            });
            this.messageService.add({
                severity: 'warn',
                summary: 'Formulario incompleto',
                detail: 'Por favor completa todos los campos requeridos',
                life: 3000
            });
            return;
        }

        this.guardando = true;
        const datosCliente = this.form.value;
        console.log(datosCliente)

        this.tiendaClienteService.insertarCliente(datosCliente).subscribe({
            next: (response) => {
                this.guardando = false;
                if (response.p_estado === 1) {
                    this.cedula = response.data.numero_id;
                    this.clienteVerificado = true;

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Cliente registrado',
                        detail: 'El cliente ha sido registrado exitosamente',
                        life: 4000
                    });
                    this.cerrarModalRegistro();
                } else if (response.p_estado === 0) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al registrar',
                        detail: response.p_mensaje || 'El cliente ya existe en el sistema"',
                        life: 3000
                    });
                    this.cerrarModalRegistro();

                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al registrar',
                        detail: response.p_mensaje || 'No se pudo registrar el cliente',
                        life: 3000
                    });
                }
            },
            error: (error) => {
                this.guardando = false;
                console.error('Error al registrar cliente:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo registrar el cliente',
                    life: 3000
                });
            }
        });
    }
}
