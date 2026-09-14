// ============================================================
//  MOTORE DI STIMA ADATTIVO  —  Hagenthon / Inclusione Finanziaria
//  Stack: Fastify. Stato in memoria (sufficiente per la demo).
//  Modello: Rasch (IRT 1PL) + update stile gradiente/Elo.
//
//  Endpoint esposti:
//    POST /start         → avvia sessione, restituisce primo item
//    POST /next          → riceve risposta, restituisce prossimo item o profilo
//    POST /retest/start  → avvia re-test (dopo le micro-lezioni)
//    POST /retest        → riceve risposta re-test, restituisce confronto before/after
// ============================================================

import Fastify from 'fastify';
import cors from '@fastify/cors';

const app = Fastify({ logger: false });

// Abilita CORS per le chiamate dal frontend Angular
await app.register(cors, {
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
  methods: ['GET', 'POST'],
});

// ---- 1. BANCA DI ITEM E CONTENUTO ----------------------------
// Fonte unica di verita': tutti gli item e le micro-lezioni stanno
// in content.js. Qui vengono solo importati.
import { ITEMS, scegliLezione } from './content.js';


// Elenco dei concetti unici presenti nella banca
const CONCETTI = [...new Set(ITEMS.map(i => i.concetto))];

// ---- 2. PARAMETRI DEL MOTORE ---------------------------------
const K          = 0.7;   // tasso di apprendimento dell'update di theta (tarato via simulazione)
const THETA0     = 0.0;   // stima iniziale (neutra)
const SIGMA0     = 1.0;   // incertezza iniziale (alta: non sappiamo nulla)
const SIGMA_MIN  = 0.55;  // sotto questa soglia il concetto e' "misurato"
const MAX_ITEM   = 10;    // tetto di item per non annoiare l'utente

// ---- 3. STATO PER SESSIONE (in memoria) ----------------------
const sessioni = new Map();

function nuovaSessione() {
  const abilita = {};
  for (const c of CONCETTI) abilita[c] = { theta: THETA0, sigma: SIGMA0, risposte: 0 };
  return { abilita, serviti: [], contatore: 0 };
}

// ---- 4. FUNZIONI DEL MODELLO ---------------------------------
// Probabilita' di risposta corretta (sigmoide di Rasch)
const pCorretto = (theta, difficolta) => 1 / (1 + Math.exp(-(theta - difficolta)));

// Aggiorna theta e sigma di un concetto dopo una risposta
function aggiorna(stato, concetto, difficolta, esatto) {
  const a = stato.abilita[concetto];
  const p = pCorretto(a.theta, difficolta);
  a.theta += K * ((esatto ? 1 : 0) - p);   // passo di gradiente / Elo
  a.sigma  = Math.max(SIGMA_MIN * 0.6, a.sigma * 0.8); // l'incertezza si stringe ad ogni risposta
  a.risposte += 1;
}

// L'informazione di Fisher e' massima quando p = 0.5 -> p*(1-p).
// Scegliamo il concetto piu' incerto e, dentro quello, l'item la cui
// difficolta' rende la risposta piu' vicina a 50-50.
function prossimoItem(stato) {
  // La diagnosi (test iniziale) usa SOLO gli item marcati fase: 'iniziale'.
  const candidati = ITEMS.filter(i => i.fase === 'iniziale' && !stato.serviti.includes(i.id));
  if (candidati.length === 0) return null;

  // Concetti ancora non "misurati", ordinati per incertezza decrescente
  const daMisurare = CONCETTI
    .filter(c => stato.abilita[c].sigma > SIGMA_MIN)
    .sort((x, y) => stato.abilita[y].sigma - stato.abilita[x].sigma);

  const target = daMisurare[0] ?? CONCETTI[0]; // fallback: primo concetto
  const theta  = stato.abilita[target].theta;

  const dentroConcetto = candidati.filter(i => i.concetto === target);
  const pool = dentroConcetto.length ? dentroConcetto : candidati;

  // Item con informazione massima = |p - 0.5| minima
  pool.sort((i, j) =>
    Math.abs(pCorretto(theta, i.difficolta) - 0.5) -
    Math.abs(pCorretto(theta, j.difficolta) - 0.5));
  return pool[0];
}

// La diagnosi finisce quando: tutti i concetti sono misurati, si tocca il
// tetto di item, oppure gli item iniziali sono esauriti.
function diagnosiFinita(stato) {
  const tuttiMisurati = CONCETTI.every(c => stato.abilita[c].sigma <= SIGMA_MIN);
  const itemIniziali  = ITEMS.filter(i => i.fase === 'iniziale').length;
  const itemFiniti    = stato.serviti.length >= itemIniziali;
  return tuttiMisurati || stato.contatore >= MAX_ITEM || itemFiniti;
}

// Costruisce il profilo finale: forte / medio / debole per concetto.
// Soglie: >= 0.3 forte, <= -0.3 debole, altrimenti medio.
function profilo(stato) {
  return CONCETTI.map(c => {
    const t = stato.abilita[c].theta;
    let livello = 'medio';
    if (t >= 0.3)  livello = 'forte';
    if (t <= -0.3) livello = 'debole';
    return { concetto: c, theta: Math.round(t * 100) / 100, livello, risposte: stato.abilita[c].risposte };
  });
}

// Costruisce la risposta di fine diagnosi: profilo + micro-lezioni gia'
// selezionate (con l'intensita' giusta) per ogni concetto debole.
// Il frontend le riceve pronte da mostrare, senza logica aggiuntiva.
function rispostaProfilo(stato) {
  const prof = profilo(stato);
  const deboli = prof.filter(p => p.livello === 'debole');
  const lezioni = deboli.map(p => scegliLezione(p.concetto, p.theta));

  // Salviamo il theta "before" dei concetti deboli: e' il punto di partenza
  // contro cui confronteremo il re-test (evidenza before/after).
  stato.before = {};
  for (const p of deboli) stato.before[p.concetto] = p.theta;
  stato.concettiDeboli = deboli.map(p => p.concetto);
  stato.faseCorrente = 'lezioni'; // dopo il profilo arrivano le lezioni, poi il re-test

  return {
    fase: 'profilo',
    profilo: prof,
    concettiDaRinforzare: deboli.map(p => p.concetto),
    lezioni,
  };
}

// Sceglie il prossimo item del RE-TEST: solo item marcati fase: 'finale',
// solo sui concetti che erano deboli. Sono item mai visti nella diagnosi
// (le due fasi usano set disgiunti), quindi misurano comprensione, non memoria.
function prossimoItemRetest(stato) {
  const candidati = ITEMS.filter(i =>
    i.fase === 'finale' &&
    stato.concettiDeboli.includes(i.concetto) &&
    !stato.serviti.includes(i.id));
  if (candidati.length === 0) return null;
  // Concetti deboli con meno item di verifica gia' somministrati, prima
  const giaVerificati = stato.retestServiti?.map(id => ITEMS.find(i => i.id === id)?.concetto) ?? [];
  const conteggio = c => giaVerificati.filter(x => x === c).length;
  const target = [...stato.concettiDeboli].sort((a, b) => conteggio(a) - conteggio(b))[0];
  const pool = candidati.filter(i => i.concetto === target);
  return (pool.length ? pool : candidati)[0];
}

// Confronto finale before/after per ogni concetto che era debole.
function rispostaRetest(stato) {
  const dopo = profilo(stato);
  const confronto = stato.concettiDeboli.map(c => {
    const before = stato.before[c];
    const after = dopo.find(p => p.concetto === c).theta;
    return {
      concetto: c,
      before: Math.round(before * 100) / 100,
      after: Math.round(after * 100) / 100,
      delta: Math.round((after - before) * 100) / 100,
      migliorato: after > before,
    };
  });
  return { fase: 'risultato', confronto };
}

// Rimuove la soluzione prima di mandare l'item al frontend
const spedibile = (item) => ({
  id: item.id, concetto: item.concetto, testo: item.testo,
  opzioni: item.opzioni.map(o => ({ id: o.id, testo: o.testo })),
});

// ---- 5. ENDPOINT ---------------------------------------------
// Avvia una sessione e restituisce il primo item
app.post('/start', async () => {
  const id = Math.random().toString(36).slice(2);
  const stato = nuovaSessione();
  sessioni.set(id, stato);
  const item = prossimoItem(stato);
  stato.serviti.push(item.id);
  stato.contatore += 1;
  return { sessionId: id, item: spedibile(item), fase: 'diagnosi' };
});

// Riceve una risposta, aggiorna la stima, restituisce il prossimo item
// oppure il profilo se la diagnosi e' finita.
// body atteso: { sessionId, itemId, opzioneId }
app.post('/next', async (req, reply) => {
  const { sessionId, itemId, opzioneId } = req.body ?? {};
  const stato = sessioni.get(sessionId);
  if (!stato) return reply.code(404).send({ errore: 'sessione non trovata' });

  const item = ITEMS.find(i => i.id === itemId);
  if (!item) return reply.code(400).send({ errore: 'item non valido' });

  const esatto = item.opzioni.find(o => o.id === opzioneId)?.correct === true;
  aggiorna(stato, item.concetto, item.difficolta, esatto);

  if (diagnosiFinita(stato)) {
    return { esatto, ...rispostaProfilo(stato) };
  }

  const succ = prossimoItem(stato);
  if (!succ) {   // rete di sicurezza: banca esaurita
    return { esatto, ...rispostaProfilo(stato) };
  }
  stato.serviti.push(succ.id);
  stato.contatore += 1;
  return { esatto, fase: 'diagnosi', item: spedibile(succ), progresso: stato.contatore };
});

// Avvia la fase di re-test: restituisce il primo item nuovo sui concetti deboli.
// Va chiamato dopo che l'utente ha visto le micro-lezioni.
// body atteso: { sessionId }
app.post('/retest/start', async (req, reply) => {
  const { sessionId } = req.body ?? {};
  const stato = sessioni.get(sessionId);
  if (!stato) return reply.code(404).send({ errore: 'sessione non trovata' });
  if (!stato.concettiDeboli?.length) {
    return { fase: 'risultato', confronto: [] }; // nessun concetto debole: niente da riverificare
  }
  stato.retestServiti = [];
  stato.faseCorrente = 'retest';
  const item = prossimoItemRetest(stato);
  if (!item) return { esatto: null, ...rispostaRetest(stato) };
  stato.serviti.push(item.id);
  stato.retestServiti.push(item.id);
  return { item: spedibile(item), fase: 'retest' };
});

// Riceve una risposta del re-test, aggiorna theta, restituisce il prossimo
// item di verifica oppure il confronto before/after finale.
// body atteso: { sessionId, itemId, opzioneId }
app.post('/retest', async (req, reply) => {
  const { sessionId, itemId, opzioneId } = req.body ?? {};
  const stato = sessioni.get(sessionId);
  if (!stato) return reply.code(404).send({ errore: 'sessione non trovata' });

  const item = ITEMS.find(i => i.id === itemId);
  if (!item) return reply.code(400).send({ errore: 'item non valido' });

  const esatto = item.opzioni.find(o => o.id === opzioneId)?.correct === true;
  aggiorna(stato, item.concetto, item.difficolta, esatto);

  const succ = prossimoItemRetest(stato);
  if (!succ) {   // finiti gli item di verifica: mostra il confronto
    return { esatto, ...rispostaRetest(stato) };
  }
  stato.serviti.push(succ.id);
  stato.retestServiti.push(succ.id);
  return { esatto, fase: 'retest', item: spedibile(succ) };
});

// Avvia il server sulla porta configurata (default 3000)
const porta = parseInt(process.env.PORT ?? '3000', 10);
app.listen({ port: porta }, (err) => {
  if (err) { console.error(err); process.exit(1); }
  console.log(`Motore di stima in ascolto su http://localhost:${porta}`);
});
