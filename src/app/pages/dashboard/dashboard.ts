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
export class Dashboard {
    totalHoy: number = 0;
    totalSemana: number = 0;
    totalMes: number = 0;

    chartData: any;
    chartOptions: any;

    topClientes: any[] = [];
    clientesChartData: any;
    clientesChartOptions: any;

    constructor(private http: HttpClient, private analiticaService: AnaliticaService) { }

    ngOnInit() {
        this.getVentasData();
        this.initChartOptions();
        this.getTopClientes();
        this.initChartOptions();
        this.initClientesChartOptions();
    }

    getTopClientes() {
        this.analiticaService.getUltimasCincoVentas().subscribe({
            next: (response) => {
                if (response.p_estado === 1) {
                    this.topClientes = response.data;
                    this.updateClientesChartData();
                }
            },
            error: (error) => {
                console.error('Error al cargar top clientes:', error);
            }
        });
    }

    getVentasData() {
        // Reemplaza con tu URL del backend
        this.analiticaService.getTopVentas().subscribe({
            next: (data) => {
                this.totalHoy = parseFloat(data.totalHoy[0].total_hoy);
                this.totalSemana = parseFloat(data.totalSemana[0].total_semana);
                this.totalMes = parseFloat(data.totalMes[0].total_mes);

                this.updateChartData();
            },
            error: (error) => {
                console.error('Error al cargar datos:', error);
            }
        });
    }

    updateChartData() {
        const documentStyle = getComputedStyle(document.documentElement);

        this.chartData = {
            labels: ['Hoy', 'Semana', 'Mes'],
            datasets: [
                {
                    label: 'Ingresos',
                    data: [this.totalHoy, this.totalSemana, this.totalMes],
                    backgroundColor: [
                        '#FE6A35', // Azul para Hoy
                        '#8B5CF6', // Púrpura para Semana
                        '#10B981'  // Verde para Mes
                    ],
                    borderRadius: 8,
                    barThickness: 80
                }
            ]
        };
    }

    initChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color') || '#495057';
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

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    updateClientesChartData() {
        const nombres = this.topClientes.map(c => {
            // Acortar nombres largos
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

    // Opciones para el gráfico de clientes (horizontal)
    initClientesChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

        this.clientesChartOptions = {
            indexAxis: 'y', // Esto hace que las barras sean horizontales
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
        }
    }
}
