import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject, ElementRef } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosiComponent {
  private svc    = inject(AssessmentService);
  private router = inject(Router);
  private cdr    = inject(ChangeDetectorRef);
  private elRef  = inject(ElementRef);

  mostraIntro  = true;
  item: Item | null = null;
  progresso    = 0;
  caricamento  = false;
  panelSelezionato: string | null = null;
  esitoFlash: 'correct' | 'wrong' | null = null;
  risposteGiuste = 0;
  animaCard = false;

  inizia(): void {
    this.mostraIntro = false;
    this.caricamento = true;
    this.svc.startSession().subscribe({
      next: (res) => {
        this.item = res.item;
        this.caricamento = false;
        this.triggerAnimation();
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
        }, 900);
      },
      error: (err) => console.error('Errore risposta:', err),
    });
  }

  private gestisciRisposta(res: any): void {
    this.panelSelezionato = null;
    this.esitoFlash = null;

    if (res.fase === 'diagnosi') {
      this.item = res.item;
      this.progresso = res.progresso ?? this.progresso + 1;
      this.triggerAnimation();
    } else if (res.fase === 'profilo') {
      const dati = res as RispostaProfilo;
      this.router.navigate(['/profilo'], { state: { dati } });
    }
  }

  private triggerAnimation(): void {
    this.animaCard = false;
    setTimeout(() => {
      this.animaCard = true;
      this.cdr.markForCheck();
      // Ripristino del focus sul primo pulsante disponibile (WCAG 2.4.3).
      // Il timeout aggiuntivo lascia tempo ad Angular di renderizzare
      // i nuovi pulsanti con [disabled] rimosso prima di cercarli nel DOM.
      setTimeout(() => {
        const firstBtn = this.elRef.nativeElement
          .querySelector<HTMLButtonElement>('.option-band:not([disabled])');
        firstBtn?.focus();
      }, 80);
    }, 30);
  }
}
