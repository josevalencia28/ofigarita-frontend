import { Routes } from "@angular/router";
import { Layout } from "./layout";

export const layoutRoutes: Routes = [
    {
        path: '', component: Layout, children: [
            { path: 'dashboard', loadComponent: () => import('../pages/dashboard/dashboard').then(m => m.Dashboard) },
            { path: 'ventas', loadComponent: () => import('../pages/ventas/ventas').then(m => m.Ventas) },
            { path: 'actualizar-cartera', loadComponent: () => import('../pages/actualizar-cartera/actualizar-cartera').then(m => m.ActualizarCartera) },
            { path: 'notificar-factura', loadComponent: () => import('../pages/notificar-factura/notificar-factura').then(m => m.NotificarFactura) },
            { path: 'ingresar-producto', loadComponent: () => import('../pages/ingreso-producto/ingreso-producto').then(m => m.IngresoProducto) },
            { path: 'ingresar-compra', loadComponent: () => import('../pages/ingreso-compra/ingreso-compra').then(m => m.IngresoCompra) },
        ],
    },

];
