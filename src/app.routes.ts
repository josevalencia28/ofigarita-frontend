// app.routes.ts - Configuración correcta para tu estructura

import { Routes } from '@angular/router';
import { Notfound } from './app/pages/notfound/notfound';
import { Login } from '@/pages/auth/login/login';
import { AuthGuard } from '@/guards/auth-guard';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/tienda', // Redirigir a tienda por defecto
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'layout',
    loadChildren: () => import('./app/layout/layout.routes').then((m) => m.layoutRoutes),
    canActivate: [AuthGuard]
  },

  // Ruta para la tienda de clientes (pública - standalone component)
  {
    path: 'tienda',
    loadComponent: () => import('./app/pages/portalCompras/tiendaClientes/tienda-cliente').then(m => m.TiendaClienteComponent)
  },

  {
    path: 'notfound',
    component: Notfound
  },

  {
    path: '**',
    redirectTo: '/notfound'
  }
];
