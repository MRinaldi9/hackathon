// ============================================================
// AssessmentService — wrapper HTTP verso il backend Fastify.
// Incapsula tutte le chiamate al motore IRT: diagnosi e re-test.
// Usato da tutti i componenti di pagina; la sessione viene
// memorizzata qui in modo che persista tra i componenti.
// ============================================================
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// -- Tipi dello stato condiviso ----------------------------

/** Un'opzione di risposta ricevuta dal backend (senza la soluzione). */
export interface Opzione {
  id: string;
  testo: string;
}

/** Un item della simulazione (domanda + opzioni camuffate). */
export interface Item {
  id: string;
  concetto: string;
  testo: string;
  opzioni: Opzione[];
}

/** Voce del profilo di competenza per un singolo concetto. */
export interface VoceProfilo {
  concetto: string;
  theta: number;           // stima IRT (-2..+2 circa)
  livello: 'forte' | 'medio' | 'debole';
  risposte: number;
}

/** Micro-lezione adattiva restituita dal backend. */
export interface Lezione {
  concetto: string;
  titolo: string;
  intensita: 'fondamenta' | 'rinforzo' | 'cenno';
  idea: string;
  esempio: string;
  takeaway: string;
}

/** Confronto before/after per un concetto (restituto dal re-test). */
export interface Confronto {
  concetto: string;
  before: number;
  after: number;
  delta: number;
  migliorato: boolean;
}

// -- Risposte del backend ----------------------------------

export interface RispostaStart {
  sessionId: string;
  item: Item;
  fase: 'diagnosi';
}

export interface RispostaDiagnosi {
  esatto: boolean;
  fase: 'diagnosi';
  item: Item;
  progresso: number;
}

export interface RispostaProfilo {
  esatto: boolean;
  fase: 'profilo';
  profilo: VoceProfilo[];
  concettiDaRinforzare: string[];
  lezioni: Lezione[];
}

export type RispostaNext = RispostaDiagnosi | RispostaProfilo;

export interface RispostaRetestStart {
  item: Item;
  fase: 'retest';
}

export interface RispostaRetest {
  esatto: boolean;
  fase: 'retest';
  item: Item;
}

export interface RispostaFinale {
  fase: 'risultato';
  confronto: Confronto[];
}

export type RispostaRetestNext = RispostaRetest | RispostaFinale;

// -- Servizio ----------------------------------------------

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  // L'ID sessione viene impostato da startSession() e usato da tutte le chiamate successive.
  readonly sessionId = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /** Avvia una nuova sessione e riceve il primo item diagnostico. */
  startSession(): Observable<RispostaStart> {
    return this.http.post<RispostaStart>('/start', {}).pipe(
      tap(res => this.sessionId.set(res.sessionId)),
    );
  }

  /** Invia la risposta dell'utente e riceve il prossimo item oppure il profilo. */
  sendAnswer(itemId: string, opzioneId: string): Observable<RispostaNext> {
    return this.http.post<RispostaNext>('/next', {
      sessionId: this.sessionId(),
      itemId,
      opzioneId,
    });
  }

  /** Avvia il re-test (chiamare dopo che l'utente ha visto le micro-lezioni). */
  startRetest(): Observable<RispostaRetestStart> {
    return this.http.post<RispostaRetestStart>('/retest/start', {
      sessionId: this.sessionId(),
    });
  }

  /** Invia la risposta al re-test e riceve il prossimo item oppure il confronto finale. */
  sendRetestAnswer(itemId: string, opzioneId: string): Observable<RispostaRetestNext> {
    return this.http.post<RispostaRetestNext>('/retest', {
      sessionId: this.sessionId(),
      itemId,
      opzioneId,
    });
  }
}
