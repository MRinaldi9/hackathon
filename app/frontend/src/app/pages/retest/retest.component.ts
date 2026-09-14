// ============================================================
// RetestComponent — fase di verifica finale (re-test).
//
// Usa item di fase 'finale' mai visti nella diagnosi, solo sui
// concetti che erano deboli. Questo garantisce che un miglioramento
// nel theta misuri comprensione, non memoria della risposta.
//
// Flusso:
//   1. ngOnInit: chiama startRetest()
//   2. L'utente risponde ad ogni item
//   3. Quando il backend restituisce fase:'risultato', naviga a /risultato
// ============================================================
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { AssessmentService, Item, RispostaFinale } from '../../services/assessment.service';

@Component({
  selector: 'app-retest',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './retest.component.html',
  styleUrls: ['./retest.component.scss'],
})
export class RetestComponent implements OnInit {
  private svc    = inject(AssessmentService);
  private router = inject(Router);

  item: Item | null = null;
  caricamento  = true;
  feedback: 'esatta' | 'errata' | null = null;
  opzioneScelta: string | null = null;

  ngOnInit(): void {
    this.svc.startRetest().subscribe({
      next: (res) => {
        if ((res as any).fase === 'risultato') {
          // Nessun concetto debole da riverificare
          this.navigaRisultato(res as unknown as RispostaFinale);
        } else {
          this.item = res.item;
          this.caricamento = false;
        }
      },
      error: (err) => {
        console.error('Errore avvio re-test:', err);
        this.caricamento = false;
      },
    });
  }

  scegli(opzioneId: string): void {
    if (this.opzioneScelta) return;

    this.opzioneScelta = opzioneId;

    this.svc.sendRetestAnswer(this.item!.id, opzioneId).subscribe({
      next: (res) => {
        this.feedback = (res as any).esatto ? 'esatta' : 'errata';
        setTimeout(() => {
          this.feedback = null;
          this.opzioneScelta = null;

          if (res.fase === 'retest') {
            this.item = (res as any).item;
          } else if (res.fase === 'risultato') {
            this.navigaRisultato(res as RispostaFinale);
          }
        }, 800);
      },
      error: (err) => console.error('Errore risposta re-test:', err),
    });
  }

  private navigaRisultato(res: RispostaFinale): void {
    this.router.navigate(['/risultato'], { state: { confronto: res.confronto } });
  }
}
