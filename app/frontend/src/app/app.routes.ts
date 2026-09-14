// Routing dell'applicazione: una route per fase del percorso adattivo.
// Il flusso è lineare: home → diagnosi → profilo → retest → risultato.
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    // La home page carica il componente radice che gestisce la fase corrente
    // (lazy-load per tenere il bundle iniziale leggero)
    loadComponent: () =>
      import('./pages/diagnosi/diagnosi.component').then(m => m.DiagnosiComponent),
  },
  {
    path: 'profilo',
    loadComponent: () =>
      import('./pages/profilo/profilo.component').then(m => m.ProfiloComponent),
  },
  {
    path: 'retest',
    loadComponent: () =>
      import('./pages/retest/retest.component').then(m => m.RetestComponent),
  },
  {
    path: 'risultato',
    loadComponent: () =>
      import('./pages/risultato/risultato.component').then(m => m.RisultatoComponent),
  },
  // Fallback: qualsiasi URL non riconosciuto torna alla home
  { path: '**', redirectTo: '' },
];
