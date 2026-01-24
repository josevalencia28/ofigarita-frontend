import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { appConfig } from './app.config';
import { AppComponent } from './app.component';
import { environment } from './enviroments/enviroment.';
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { MessageService,ConfirmationService } from 'primeng/api';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { authInterceptor } from '@/interceptors/auth-interceptors';
import { cryptoInterceptor, } from '@/interceptors/crypto-interceptor';
import { tokenInterceptor } from '@/interceptors/token-interceptor';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import {Toast} from 'primeng/toast'

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),

    // habilita que HttpClient use interceptores disponibles en DI
    // provideHttpClient(withInterceptors([
    //   cryptoInterceptor,
    //   tokenInterceptor,
    //   authInterceptor
    // ])),
    importProvidersFrom(BrowserAnimationsModule),
    MessageService,
    ConfirmationService
  ]
}).catch(err => console.error(err));
