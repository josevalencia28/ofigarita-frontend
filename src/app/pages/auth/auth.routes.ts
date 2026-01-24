import { Routes } from '@angular/router';
import { Access } from './access/access';
import { Login } from './login/login';


export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login }
] as Routes;
