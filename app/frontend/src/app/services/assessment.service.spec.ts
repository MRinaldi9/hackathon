import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import {
  AssessmentService,
  Item,
  RispostaStart,
  RispostaDiagnosi,
  RispostaRetestStart,
} from './assessment.service';

const itemFinto: Item = {
  id: 'q1',
  concetto: 'inflazione',
  testo: 'Cosa succede al potere d’acquisto con l’inflazione?',
  opzioni: [
    { id: 'a', testo: 'Aumenta' },
    { id: 'b', testo: 'Diminuisce' },
  ],
};

describe('AssessmentService', () => {
  let service: AssessmentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AssessmentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('viene creato con sessionId nullo', () => {
    expect(service).toBeTruthy();
    expect(service.sessionId()).toBeNull();
  });

  it('startSession fa POST /start e memorizza il sessionId', () => {
    let ricevuta: RispostaStart | undefined;
    service.startSession().subscribe((r) => (ricevuta = r));

    const req = http.expectOne('/start');
    expect(req.request.method).toBe('POST');
    req.flush({ sessionId: 'sess-1', item: itemFinto, fase: 'diagnosi' });

    expect(ricevuta?.sessionId).toBe('sess-1');
    expect(service.sessionId()).toBe('sess-1');
  });

  it('sendAnswer fa POST /next con sessionId, itemId e opzioneId', () => {
    service.sessionId.set('sess-1');

    let ricevuta: RispostaDiagnosi | undefined;
    service.sendAnswer('q1', 'b').subscribe((r) => (ricevuta = r as RispostaDiagnosi));

    const req = http.expectOne('/next');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      sessionId: 'sess-1',
      itemId: 'q1',
      opzioneId: 'b',
    });
    req.flush({ esatto: true, fase: 'diagnosi', item: itemFinto, progresso: 1 });

    expect(ricevuta?.esatto).toBe(true);
    expect(ricevuta?.progresso).toBe(1);
  });

  it('startRetest fa POST /retest/start con il sessionId corrente', () => {
    service.sessionId.set('sess-9');

    let ricevuta: RispostaRetestStart | undefined;
    service.startRetest().subscribe((r) => (ricevuta = r));

    const req = http.expectOne('/retest/start');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ sessionId: 'sess-9' });
    req.flush({ item: itemFinto, fase: 'retest' });

    expect(ricevuta?.fase).toBe('retest');
  });

  it('sendRetestAnswer fa POST /retest con il payload della risposta', () => {
    service.sessionId.set('sess-9');
    service.sendRetestAnswer('q1', 'a').subscribe();

    const req = http.expectOne('/retest');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      sessionId: 'sess-9',
      itemId: 'q1',
      opzioneId: 'a',
    });
    req.flush({ esatto: false, fase: 'retest', item: itemFinto });
  });
});
