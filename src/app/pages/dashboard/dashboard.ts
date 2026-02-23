import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { HttpClient } from '@angular/common/http';
import { AnaliticaService } from '@/pages/service/analitica.service';

@Component({
    selector: 'app-dashboard',
    imports: [CommonModule, CardModule, ChartModule],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
    totalHoy: number = 0;
    totalSemana: number = 0;
    totalMes: number = 0;

    chartData: any;
    chartOptions: any;

    topClientes: any[] = [];
    clientesChartData: any;
    clientesChartOptions: any;

    ventasAnualesChartData: any;
    ventasAnualesChartOptions: any;

    topProductos: any[] = [];
    productosChartData: any;
    productosChartOptions: any;

    constructor(private http: HttpClient, private analiticaService: AnaliticaService) { }

    ngOnInit() {
        // Inicializar todas las opciones de gráficos primero
        this.initChartOptions();
        this.initClientesChartOptions();
        this.initProductosChartOptions();
        this.initVentasAnualesChartOptions();

        // Luego cargar los datos
        this.getVentasData();
        this.getTopClientes();
        this.getVentasAnuales();
        this.getTopProductos();
    }

    getTopClientes() {
        this.analiticaService.getUltimasCincoVentas().subscribe({
            next: (response) => {
                if (response.p_estado === 1 && response.data && response.data.length > 0) {
                    this.topClientes = response.data;
                    this.updateClientesChartData();
                }
            },
            error: (error) => {
                console.error('Error al cargar top clientes:', error);
            }
        });
    }

    getTopProductos() {
        this.analiticaService.getProductosMasVendidosMes().subscribe({
            next: (response) => {
                console.log('Respuesta productos:', response);

                // El backend retorna directamente un array
                if (Array.isArray(response) && response.length > 0) {
                    this.topProductos = response;
                    this.updateProductosChartData();
                } else if (response && response.p_estado === 1 && response.data && response.data.length > 0) {
                    // Por si acaso retorna con estructura {p_estado, data}
                    this.topProductos = response.data;
                    this.updateProductosChartData();
                } else {
                    console.warn('No hay productos disponibles');
                    this.initializeEmptyProductosChart();
                }
            },
            error: (error) => {
                console.error('Error al cargar top productos:', error);
                this.initializeEmptyProductosChart();
            }
        });
    }

    initializeEmptyProductosChart() {
        this.productosChartData = {
            labels: ['Sin datos'],
            datasets: [{
                label: 'Unidades Vendidas',
                data: [0],
                backgroundColor: '#10B981',
                borderRadius: 6,
                barThickness: 24
            }]
        };
    }

    getVentasData() {
        this.analiticaService.getTopVentas().subscribe({
            next: (data) => {
                this.totalHoy = parseFloat(data.totalHoy[0].total_hoy) || 0;
                this.totalSemana = parseFloat(data.totalSemana[0].total_semana) || 0;
                this.totalMes = parseFloat(data.totalMes[0].total_mes) || 0;

                this.updateChartData();
            },
            error: (error) => {
                console.error('Error al cargar datos:', error);
            }
        });
    }

    updateChartData() {
        this.chartData = {
            labels: ['Hoy', 'Semana', 'Mes'],
            datasets: [
                {
                    label: 'Hoy',
                    data: [this.totalHoy, 0, 0],
                    backgroundColor: '#FE6A35',
                    borderRadius: 8,
                    barThickness: 80
                },
                {
                    label: 'Semana',
                    data: [0, this.totalSemana, 0],
                    backgroundColor: '#8B5CF6',
                    borderRadius: 8,
                    barThickness: 80
                },
                {
                    label: 'Mes',
                    data: [0, 0, this.totalMes],
                    backgroundColor: '#10B981',
                    borderRadius: 8,
                    barThickness: 80
                }
            ]
        };
    }

    getVentasAnuales() {
        this.analiticaService.getVentasAnuales().subscribe({
            next: (data) => {
                if (data && data.length > 0) {
                    this.updateVentasAnualesChartData(data);
                }
            },
            error: (error) => {
                console.error('Error al cargar ventas anuales:', error);
            }
        });
    }

    updateVentasAnualesChartData(ventasData: any[]) {
        const añosUnicos = [...new Set(ventasData.map(v => v.año))].sort();

        const meses = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
            'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

        const coloresAnios: { [key: string]: string } = {
            '2024': '#EC4899',
            '2025': '#3B82F6',
            '2026': '#10B981'
        };

        const datasets = añosUnicos.map(año => {
            const datosDelAño = meses.map(mes => {
                const registro = ventasData.find(v =>
                    v.año === año && v.nombre_mes.toUpperCase() === mes
                );
                return registro ? parseFloat(registro.total_ventas) : 0;
            });

            return {
                label: año,
                data: datosDelAño,
                backgroundColor: coloresAnios[año] || '#6B7280',
                borderRadius: 4,
                barThickness: 20
            };
        });

        this.ventasAnualesChartData = {
            labels: meses,
            datasets: datasets
        };
    }

    updateClientesChartData() {
        const nombres = this.topClientes.map(c => {
            const nombreCompleto = c.nombre_completo;
            const palabras = nombreCompleto.split(' ');
            return palabras.length > 2
                ? `${palabras[0]} ${palabras[1]}`
                : nombreCompleto;
        });

        const valores = this.topClientes.map(c => parseFloat(c.total_comprado));

        this.clientesChartData = {
            labels: nombres,
            datasets: [
                {
                    label: 'Cantidad',
                    data: valores,
                    backgroundColor: '#3B82F6',
                    borderRadius: 6,
                    barThickness: 24
                }
            ]
        };
    }

    updateProductosChartData() {
        const nombres = this.topProductos.map(p => {
            const nombreProducto = p.producto;
            // Acortar nombres largos para que quepan en el gráfico
            return nombreProducto.length > 25
                ? nombreProducto.substring(0, 25) + '...'
                : nombreProducto;
        });

        const valores = this.topProductos.map(p => parseInt(p.total_vendido, 10));

        this.productosChartData = {
            labels: nombres,
            datasets: [
                {
                    label: 'Unidades Vendidas',
                    data: valores,
                    backgroundColor: '#10B981',
                    borderRadius: 6,
                    barThickness: 24
                }
            ]
        };
    }

    initChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: textColorSecondary,
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            size: 12,
                            weight: 500
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary,
                        callback: function (value: any) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    initClientesChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

        this.clientesChartOptions = {
            indexAxis: 'y',
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: textColorSecondary,
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            size: 11
                        },
                        callback: function (value: any) {
                            return '$' + value.toLocaleString();
                        }
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            size: 11,
                            weight: 500
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        };
    }

    initProductosChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

        this.productosChartOptions = {
            indexAxis: 'y',
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: textColorSecondary,
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.x !== null) {
                                label += context.parsed.x + ' unidades';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            size: 11
                        },
                        stepSize: 1,
                        precision: 0
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            size: 11,
                            weight: 500
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        };
    }

    initVentasAnualesChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

        this.ventasAnualesChartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: textColorSecondary,
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12,
                            weight: 600
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context: any) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += '$' + context.parsed.y.toLocaleString();
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            size: 11,
                            weight: 500
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            size: 11
                        },
                        callback: function (value: any) {
                            if (value >= 1000) {
                                return '$' + (value / 1000).toFixed(0) + 'K';
                            }
                            return '$' + value.toLocaleString();
                        }
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }
}