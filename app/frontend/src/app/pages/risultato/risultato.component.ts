// ============================================================
// RisultatoComponent — confronto before/after (evidenza del miglioramento).
//
// Mostra il salto di theta per ogni concetto che era debole.
// Questo è il deliverable "Before/After Simplicity Evidence" del tema.
//
// I dati arrivano via router state dal RetestComponent.
// ============================================================
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { Confronto } from '../../services/assessment.service';

@Component({
  selector: 'app-risultato',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './risultato.component.html',
  styleUrls: ['./risultato.component.scss'],
})
export class RisultatoComponent implements OnInit {
  private router = inject(Router);

  confronto: Confronto[] = [];

  ngOnInit(): void {
    // Recupera il confronto dal router state (impostato da RetestComponent)
    const state = history.state?.['confronto'] as Confronto[] | undefined;
    this.confronto = state ?? [];
  }

  /** Mappa il delta di theta in un messaggio leggibile per l'utente. */
  messaggioDelta(c: Confronto): string {
    if (!c.migliorato) return 'Continua a esercitarti su questo concetto';
    if (c.delta >= 0.4) return 'Ottimo miglioramento!';
    return 'Sei migliorato!';
  }

  /** Larghezza barra before (0-100%) — theta mappato da [-2,+2] a [0,100] */
  larghezzaBefore(c: Confronto): number {
    return Math.max(0, Math.min(100, ((c.before + 2) / 4) * 100));
  }

  larghezzaAfter(c: Confronto): number {
    return Math.max(0, Math.min(100, ((c.after + 2) / 4) * 100));
  }

  ricomincia(): void {
    this.router.navigate(['/']);
  }
}
