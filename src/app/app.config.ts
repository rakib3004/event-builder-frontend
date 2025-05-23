import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes'; // Your route definitions

// PrimeNG Services
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Setup routing
    provideHttpClient(withInterceptorsFromDi()), // Setup HttpClient
    provideAnimations(), // Setup animations for PrimeNG

    // Global Services (like PrimeNG's MessageService and ConfirmationService)
    MessageService,
    ConfirmationService
    // EventService is already providedIn: 'root' so it's available globally
  ]
};