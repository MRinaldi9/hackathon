// ============================================================
// DiagnosiComponent — fase di assessment adattivo (simulazione).
//
// Flusso:
//   1. ngOnInit: chiama startSession() → riceve il primo item
//   2. L'utente sceglie un'opzione (tap/swipe)
//   3. sendAnswer() → riceve il prossimo item oppure il profilo
//   4. Se la risposta è 'profilo': naviga a /profilo con i dati
// ============================================================
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  AssessmentService,
  Item,
  RispostaProfilo,
} from '../../services/assessment.service';

@Component({
  selector: 'app-diagnosi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diagnosi.component.html',
  styleUrls: ['./diagnosi.component.scss'],
})
export class DiagnosiComponent implements OnInit {
  private svc    = inject(AssessmentService);
  private router = inject(Router);

  // Stato del componente
  item: Item | null = null;
  progresso    = 0;       // numero di item già risposti
  caricamento  = true;    // spinner iniziale
  feedback: 'esatta' | 'errata' | null = null; // flash visivo dopo la risposta
  opzioneScelta: string | null = null;          // ID dell'opzione selezionata

  ngOnInit(): void {
    this.svc.startSession().subscribe({
      next: (res) => {
        this.item = res.item;
        this.caricamento = false;
      },
      error: (err) => {
        console.error('Errore avvio sessione:', err);
        this.caricamento = false;
      },
    });
  }

  /** L'utente tocca un'opzione: mostra feedback visivo, poi manda la risposta. */
  scegli(opzioneId: string): void {
    if (this.opzioneScelta) return; // evita doppio tap

    this.opzioneScelta = opzioneId;

    // TODO: il backend restituisce `esatto` — per ora mostra il feedback dopo 800ms
    // e poi invia la risposta (il feedback effettivo viene mostrato nella prossima versione
    // in base alla risposta del backend per non rivelare la soluzione prima)
    this.svc.sendAnswer(this.item!.id, opzioneId).subscribe({
      next: (res) => {
        // Mostra feedback esatta/errata per 800ms
        this.feedback = (res as any).esatto ? 'esatta' : 'errata';
        setTimeout(() => this.gestisciRisposta(res), 800);
      },
      error: (err) => console.error('Errore risposta:', err),
    });
  }

  private gestisciRisposta(res: any): void {
    this.feedback = null;
    this.opzioneScelta = null;

    if (res.fase === 'diagnosi') {
      // Continua la diagnosi con il prossimo item
      this.item = res.item;
      this.progresso = res.progresso ?? this.progresso + 1;
    } else if (res.fase === 'profilo') {
      // Diagnosi completata: naviga al profilo portando i dati
      const dati = res as RispostaProfilo;
      this.router.navigate(['/profilo'], { state: { dati } });
    }
  }
}
