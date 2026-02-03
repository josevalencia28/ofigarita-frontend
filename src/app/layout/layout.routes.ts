import { Routes } from "@angular/router";
import { Layout } from "./layout";

export const layoutRoutes: Routes = [
    {
        path: '', component: Layout, children: [
            { path: 'dashboard', loadComponent: () => import('../pages/dashboard/dashboard').then(m => m.Dashboard) },
            { path: 'ventas', loadComponent: () => import('../pages/ventas/ventas').then(m => m.Ventas) },
        ],
    },

];
