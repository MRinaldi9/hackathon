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
export class DiagnosiComponent {
  private svc    = inject(AssessmentService);
  private router = inject(Router);

  mostraIntro  = true;
  item: Item | null = null;
  progresso    = 0;
  caricamento  = false;
  feedback: 'esatta' | 'errata' | null = null;
  opzioneScelta: string | null = null;
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
      },
      error: () => { this.caricamento = false; },
    });
  }

  scegli(opzioneId: string): void {
    if (this.opzioneScelta) return;
    this.opzioneScelta = opzioneId;

    this.svc.sendAnswer(this.item!.id, opzioneId).subscribe({
      next: (res) => {
        const esatto = (res as any).esatto as boolean;
        this.feedback = esatto ? 'esatta' : 'errata';
        if (esatto) this.risposteGiuste++;
        setTimeout(() => this.gestisciRisposta(res), 900);
      },
      error: (err) => console.error('Errore risposta:', err),
    });
  }

  private gestisciRisposta(res: any): void {
    this.feedback = null;
    this.opzioneScelta = null;

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
    setTimeout(() => (this.animaCard = true), 30);
  }
}
