// ============================================================
// ProfiloComponent — mostra il profilo di competenza e le micro-lezioni.
//
// Riceve i dati dalla navigazione (router state) impostato da DiagnosiComponent.
// Dopo che l'utente ha letto le lezioni, naviga a /retest.
// ============================================================
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { VoceProfilo, Lezione, RispostaProfilo } from '../../services/assessment.service';

@Component({
    selector: 'app-profilo',
    imports: [CommonModule],
    templateUrl: './profilo.component.html',
    styleUrls: ['./profilo.component.scss']
})
export class ProfiloComponent implements OnInit {
  private router = inject(Router);

  // Dati ricevuti dalla pagina precedente
  profilo: VoceProfilo[] = [];
  lezioni: Lezione[] = [];
  concettiDaRinforzare: string[] = [];

  // Navigazione tra le lezioni
  indiceLezione = 0;

  ngOnInit(): void {
    // I dati arrivano via router state (passati da DiagnosiComponent)
    const nav = this.router.currentNavigation()?.extras?.state;
    const dati = nav?.['dati'] as RispostaProfilo | undefined;

    // Fallback: recupera dallo history.state se il componente viene
    // renderizzato dopo la navigazione (nel caso Angular non esponga il nav state)
    const state = history.state?.['dati'] as RispostaProfilo | undefined;
    const fonte = dati ?? state;

    if (fonte) {
      this.profilo = fonte.profilo;
      this.lezioni = fonte.lezioni;
      this.concettiDaRinforzare = fonte.concettiDaRinforzare;
    }
  }

  get lezioneCorrente(): Lezione | null {
    return this.lezioni[this.indiceLezione] ?? null;
  }

  get haLezioniDaLeggere(): boolean {
    return this.lezioni.length > 0;
  }

  avanti(): void {
    if (this.indiceLezione < this.lezioni.length - 1) {
      this.indiceLezione++;
    } else {
      // Tutte le lezioni viste: inizia il re-test
      this.router.navigate(['/retest']);
    }
  }

  saltaAlRetest(): void {
    this.router.navigate(['/retest']);
  }

  /** Icona/emoji per il livello (si puoi sostituire con SVG) */
  iconaLivello(livello: 'forte' | 'medio' | 'debole'): string {
    return { forte: '💪', medio: '➡️', debole: '📚' }[livello];
  }
}
