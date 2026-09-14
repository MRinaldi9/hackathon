import { provideZoneChangeDetection } from "@angular/core";
// Punto di ingresso dell'applicazione Angular (standalone bootstrap)
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),provideHttpClient(withXhr()),
    provideRouter(routes),
    provideAnimations(),
  ],
}).catch(err => console.error(err));
