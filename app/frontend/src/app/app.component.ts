// Componente radice — contiene solo il router outlet.
// La logica di fase vive nei componenti figli e nel SessionService.
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    template: `<router-outlet />`,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {}
