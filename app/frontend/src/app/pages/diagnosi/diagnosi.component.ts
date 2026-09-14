import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  AssessmentService,
  Item,
  RispostaProfilo,
} from '../../services/assessment.service';
import { TrivioComponent } from '../shared/trivio/trivio.component';

@Component({
  selector: 'app-diagnosi',
  standalone: true,
  imports: [CommonModule, TrivioComponent],
  templateUrl: './diagnosi.component.html',
  styleUrls: ['./diagnosi.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosiComponent {
  private svc    = inject(AssessmentService);
  private router = inject(Router);
  private cdr    = inject(ChangeDetectorRef);

  mostraIntro  = true;
  item: Item | null = null;
  progresso    = 0;
  caricamento  = false;
  panelSelezionato: string | null = null;
  esitoFlash: 'correct' | 'wrong' | null = null;
  risposteGiuste = 0;

  inizia(): void {
    this.mostraIntro = false;
    this.caricamento = true;
    this.svc.startSession().subscribe({
      next: (res) => {
        this.item = res.item;
        this.caricamento = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.caricamento = false;
        this.cdr.markForCheck();
      },
    });
  }

  scegli(opzioneId: string): void {
    if (this.panelSelezionato) return;
    this.panelSelezionato = opzioneId;

    this.svc.sendAnswer(this.item!.id, opzioneId).subscribe({
      next: (res) => {
        const esatto = (res as any).esatto as boolean;
        this.esitoFlash = esatto ? 'correct' : 'wrong';
        if (esatto) this.risposteGiuste++;
        this.cdr.markForCheck();
        setTimeout(() => {
          this.gestisciRisposta(res);
          this.cdr.markForCheck();
        }, 1200); // lascia completare la camminata dell'avatar (~1s)
      },
      error: (err) => console.error('Errore risposta:', err),
    });
  }

  private gestisciRisposta(res: any): void {
    this.panelSelezionato = null;
    this.esitoFlash = null;

    if (res.fase === 'diagnosi') {
      // Il nuovo item, passato come @Input al trivio, resetta l'avatar
      // in basso e ripristina il focus sulla prima destinazione.
      this.item = res.item;
      this.progresso = res.progresso ?? this.progresso + 1;
    } else if (res.fase === 'profilo') {
      const dati = res as RispostaProfilo;
      this.router.navigate(['/profilo'], { state: { dati } });
    }
  }
}
