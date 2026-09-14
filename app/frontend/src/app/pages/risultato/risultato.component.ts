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

  get tuttaMigliorata(): boolean {
    return this.confronto.length > 0 && this.confronto.every(c => c.migliorato);
  }

  ngOnInit(): void {
    const state = history.state?.['confronto'] as Confronto[] | undefined;
    this.confronto = state ?? [];
  }

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
