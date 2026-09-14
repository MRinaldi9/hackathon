// Componente radice — contiene solo il router outlet.
// La logica di fase vive nei componenti figli e nel SessionService.
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    template: `<router-outlet />`,
    styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {}
