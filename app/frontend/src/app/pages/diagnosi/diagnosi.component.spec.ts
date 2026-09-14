import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DiagnosiComponent } from './diagnosi.component';
import { AssessmentService, Item } from '../../services/assessment.service';

const itemFinto: Item = {
  id: 'q1',
  concetto: 'budget',
  testo: 'Quanto dovresti risparmiare ogni mese?',
  opzioni: [
    { id: 'a', testo: 'Il 10%' },
    { id: 'b', testo: 'Niente' },
  ],
};

describe('DiagnosiComponent', () => {
  const svc = {
    startSession: vi.fn(),
    sendAnswer: vi.fn(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    svc.startSession.mockReset();
    svc.sendAnswer.mockReset();
    TestBed.configureTestingModule({
      imports: [DiagnosiComponent],
      providers: [
        { provide: AssessmentService, useValue: svc },
        provideRouter([]),
      ],
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  function crea(): DiagnosiComponent {
    return TestBed.createComponent(DiagnosiComponent).componentInstance;
  }

  it('parte mostrando l’intro', () => {
    const c = crea();
    expect(c.mostraIntro).toBe(true);
    expect(c.item).toBeNull();
  });

  it('inizia() avvia la sessione e carica il primo item', () => {
    svc.startSession.mockReturnValue(
      of({ sessionId: 's1', item: itemFinto, fase: 'diagnosi' }),
    );
    const c = crea();

    c.inizia();

    expect(svc.startSession).toHaveBeenCalledOnce();
    expect(c.mostraIntro).toBe(false);
    expect(c.caricamento).toBe(false);
    expect(c.item).toEqual(itemFinto);
  });

  it('scegli() registra la risposta esatta e incrementa il punteggio', () => {
    svc.sendAnswer.mockReturnValue(
      of({ esatto: true, fase: 'diagnosi', item: itemFinto, progresso: 2 }),
    );
    const c = crea();
    c.item = itemFinto;

    c.scegli('a');

    expect(svc.sendAnswer).toHaveBeenCalledWith('q1', 'a');
    expect(c.panelSelezionato).toBe('a');
    expect(c.esitoFlash).toBe('correct');
    expect(c.risposteGiuste).toBe(1);

    // Dopo il flash (1200ms) avanza al prossimo item.
    vi.advanceTimersByTime(1200);
    expect(c.progresso).toBe(2);
    expect(c.panelSelezionato).toBeNull();
    expect(c.esitoFlash).toBeNull();
  });

  it('scegli() ignora ulteriori tap mentre un pannello è già selezionato', () => {
    svc.sendAnswer.mockReturnValue(
      of({ esatto: false, fase: 'diagnosi', item: itemFinto, progresso: 1 }),
    );
    const c = crea();
    c.item = itemFinto;

    c.scegli('a');
    c.scegli('b'); // deve essere ignorato

    expect(svc.sendAnswer).toHaveBeenCalledOnce();
  });
});
