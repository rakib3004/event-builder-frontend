import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config'; // Import the application config

bootstrapApplication(AppComponent, appConfig) // Use appConfig
  .catch(err => console.error(err));