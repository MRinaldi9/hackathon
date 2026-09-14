import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { RisultatoComponent } from './risultato.component';
import { Confronto } from '../../services/assessment.service';

function confronto(partial: Partial<Confronto>): Confronto {
  return { concetto: 'x', before: 0, after: 0, delta: 0, migliorato: false, ...partial };
}

describe('RisultatoComponent', () => {
  const navigate = vi.fn();

  beforeEach(() => {
    navigate.mockReset();
    TestBed.configureTestingModule({
      imports: [RisultatoComponent],
      providers: [{ provide: Router, useValue: { navigate } }],
    });
  });

  function crea(): RisultatoComponent {
    return TestBed.createComponent(RisultatoComponent).componentInstance;
  }

  it('larghezzaBefore mappa theta -2..2 su 0..100 con clamp', () => {
    const c = crea();
    expect(c.larghezzaBefore(confronto({ before: -2 }))).toBe(0);
    expect(c.larghezzaBefore(confronto({ before: 0 }))).toBe(50);
    expect(c.larghezzaBefore(confronto({ before: 2 }))).toBe(100);
    expect(c.larghezzaBefore(confronto({ before: -10 }))).toBe(0);
    expect(c.larghezzaBefore(confronto({ before: 10 }))).toBe(100);
  });

  it('larghezzaAfter mappa theta -2..2 su 0..100 con clamp', () => {
    const c = crea();
    expect(c.larghezzaAfter(confronto({ after: 1 }))).toBe(75);
    expect(c.larghezzaAfter(confronto({ after: 100 }))).toBe(100);
  });

  it('tuttaMigliorata è true solo se la lista non è vuota e tutti sono migliorati', () => {
    const c = crea();
    c.confronto = [];
    expect(c.tuttaMigliorata).toBe(false);
    c.confronto = [confronto({ migliorato: true }), confronto({ migliorato: false })];
    expect(c.tuttaMigliorata).toBe(false);
    c.confronto = [confronto({ migliorato: true }), confronto({ migliorato: true })];
    expect(c.tuttaMigliorata).toBe(true);
  });

  it('ngOnInit legge il confronto da history.state', () => {
    const dati = [confronto({ concetto: 'inflazione', migliorato: true })];
    history.pushState({ confronto: dati }, '');
    const c = crea();
    c.ngOnInit();
    expect(c.confronto).toEqual(dati);
  });

  it('ngOnInit usa lista vuota se non c’è stato di navigazione', () => {
    history.pushState({}, '');
    const c = crea();
    c.ngOnInit();
    expect(c.confronto).toEqual([]);
  });

  it('ricomincia naviga alla home', () => {
    const c = crea();
    c.ricomincia();
    expect(navigate).toHaveBeenCalledWith(['/']);
  });
});
