# Hagenthon — Inclusione Finanziaria

Un'app web che insegna la finanza personale di base agli adolescenti (15-20 anni) tramite un **assessment adattivo invisibile**: l'utente prende decisioni dentro una simulazione di vita, e un motore di stima IRT/Rasch misura silenziosamente la comprensione di ogni concetto, sblocca micro-lezioni mirate solo dove serve, e dimostra il miglioramento con un re-test *before/after* misurabile.

Il progetto è stato costruito con un **approccio di agentic coding**: un orchestratore Claude Code coordina un team di sub-agenti specializzati (motore, contenuto, profilo, frontend, accessibilità), ciascuno con uno scope delimitato. È questo team di agenti che aggiunge valore concreto — non un LLM a runtime, ma una vera *capability software* con una logica applicativa spiegabile, come richiesto dal Tema 02 dell'hackathon.

## Il problema

Un adolescente di 15-20 anni ha appena iniziato a gestire denaro proprio (paghetta, primo lavoretto, prima carta, abbonamenti digitali) ma **non riconosce i meccanismi finanziari nascosti** dietro le scelte quotidiane che già compie: attiva un "3 mesi gratis" senza capire che al quarto mese scatta un addebito ricorrente, ignora le commissioni che gonfiano un prezzo, non ha idea di come risparmi o debiti crescano nel tempo.

È l'età in cui si formano le abitudini finanziarie, ma la scuola non insegna quasi nulla di pratico. La difficoltà di design: **i teenager scappano dai quiz in stile scolastico**. Qualsiasi cosa somigli a un'interrogazione viene abbandonata.

La risposta non è un chatbot che riscrive testi (esplicitamente escluso dal tema), ma un sistema che *misura* la comprensione e *personalizza* l'intervento. Un dominio così — banca item calibrata, motore di stima, contenuto educativo, frontend a gesture, accessibilità — si presta naturalmente alla **divisione in agenti specializzati**: ogni area richiede competenze diverse e vincoli diversi, e tenerle separate evita che una modifica al contenuto rompa la logica del motore o viceversa.

## L'approccio agentico

Il sistema di sviluppo è organizzato come un team di agenti Claude Code (definiti in `.claude/agents/`). Un **orchestratore** decompone i task che attraversano più aree e delega al sub-agente giusto, senza scrivere codice direttamente; ogni sub-agente ha un dominio esclusivo, un formato di output esplicito e vincoli che gli impediscono di invadere il territorio degli altri.

| Agente | Modello | Dominio esclusivo | Cosa produce |
|---|---|---|---|
| **orchestratore** | sonnet-4-5 | Decomposizione e routing dei task cross-area | Un piano JSON di sotto-task ordinati per dipendenza; non scrive codice |
| **assessment-agent** | sonnet-4-5 | Motore IRT in `engine.js` (parametri K/SIGMA/MAX_ITEM, `aggiorna`, `prossimoItem`, endpoint Fastify) | Modifiche al motore + validazione simulata su 3 profili canonici |
| **content-agent** | sonnet-4-5 | Banca item e micro-lezioni in `content.js` | Nuovi item calibrati e lezioni, con verifica della "regola d'oro" |
| **profilo-agent** | **haiku-4-5** | Classificazione forte/medio/debole e evidenza before/after (`profilo`, `rispostaProfilo`, `rispostaRetest`, `scegliLezione`) | Modifiche alle soglie + tracce demo ripetibili |
| **angular-developer** | sonnet-4-5 | Frontend Angular (`app/frontend/`): componenti, servizi, routing, gesture | Componenti standalone + OnPush + signals, conformi al contratto backend |
| **wcag-accessibility** | (default) | Revisione accessibilità WCAG 2.2 AA | Report di findings + fix; **gate obbligatorio** prima che una UI sia "completa" |

Il confine tra `assessment-agent` e `profilo-agent` è particolarmente fine: entrambi lavorano su `engine.js`, ma su **funzioni disgiunte** — la stima IRT da una parte, la classificazione e il before/after dall'altra. Questa separazione mantiene ogni prompt corto e ogni responsabilità chiara.

## Architettura e flusso

Il prodotto finale è un'app in due parti: un **backend Fastify** che ospita il motore di stima (stato di sessione in memoria) e un **frontend Angular** che guida l'utente attraverso quattro fasi.

### Flusso end-to-end dell'esperienza utente

```
                                  ┌──────────────────────────────────────────────┐
                                  │        BACKEND FASTIFY  (:3000)                │
                                  │        motore IRT/Rasch — engine.js            │
   FRONTEND ANGULAR (:4200)       │                                                │
   proxy → :3000                  │   Map sessioni  (stato in memoria per sessionId)│
                                  └──────────────────────────────────────────────┘
   ┌───────────────┐   POST /start                    ┌───────────────────────────┐
   │ 1. DIAGNOSI   │ ───────────────────────────────► │ nuovaSessione()           │
   │  (route: '')  │                                  │ prossimoItem() → item      │
   │  gesture/tap  │ ◄─────────────────────────────── │ { sessionId, item }        │
   │               │   POST /next {itemId, opzioneId} └───────────────────────────┘
   │               │ ───────────────────────────────► │ aggiorna(θ,σ)  [ciclo]     │
   │               │ ◄─── item successivo ──────────── │ prossimoItem()             │
   └───────┬───────┘                                  │ diagnosiFinita()? ─┐        │
           │  quando la diagnosi finisce, /next        │                    ▼        │
           │  restituisce già profilo + lezioni  ◄──── │ rispostaProfilo()          │
           ▼                                          │  salva before[] dei deboli │
   ┌───────────────┐                                  └───────────────────────────┘
   │ 2. PROFILO    │  mostra forte/medio/debole per concetto
   │ (route:       │  + micro-lezioni SOLO sui concetti deboli
   │  /profilo)    │  (intensità: fondamenta | rinforzo | cenno)
   └───────┬───────┘
           │  POST /retest/start {sessionId}          ┌───────────────────────────┐
           ▼ ───────────────────────────────────────►│ prossimoItemRetest()       │
   ┌───────────────┐  POST /retest {itemId,opzioneId} │  SOLO item fase 'finale'   │
   │ 3. RETEST     │ ───────────────────────────────► │  (mai visti in diagnosi)   │
   │ (route:       │ ◄─── item verifica successivo ─── │ aggiorna(θ,σ)  [ciclo]     │
   │  /retest)     │                                  └───────────────────────────┘
   └───────┬───────┘  a fine re-test /retest          ┌───────────────────────────┐
           │  restituisce il confronto          ◄──── │ rispostaRetest()           │
           ▼                                          │  { before, after, delta }  │
   ┌───────────────┐                                  └───────────────────────────┘
   │ 4. RISULTATO  │  before/after per concetto: la prova del miglioramento
   │ (route:       │  misurabile — il deliverable chiave del tema
   │  /risultato)  │
   └───────────────┘
```

**Passo per passo:**

1. **Diagnosi** (`POST /start` → `POST /next` in ciclo). Ogni scelta dell'utente è un item diagnostico camuffato. Dopo ogni risposta il motore aggiorna la stima di abilità `θ` del concetto con un passo di gradiente stile Elo (`θ += K·(risposta − P)`) e stringe l'incertezza `σ`. Il prossimo item è scelto puntando all'informazione massima (risposta più vicina a 50-50) sul concetto più incerto.
2. **Fine diagnosi.** Quando tutti i concetti sono "misurati" (`σ ≤ SIGMA_MIN`), si tocca il tetto di item (`MAX_ITEM`), o gli item iniziali sono esauriti, `/next` restituisce **già** il profilo e le micro-lezioni pronte. Il θ dei concetti deboli viene salvato come snapshot `before`.
3. **Profilo + micro-lezioni** (route `/profilo`). Il frontend mostra forte/medio/debole per concetto e presenta le lezioni **solo sui concetti deboli**, con intensità proporzionale alla lacuna.
4. **Re-test** (`POST /retest/start` → `POST /retest` in ciclo, route `/retest`). Somministra **solo item di fase `finale`**, mai visti nella diagnosi: così un miglioramento non è spiegabile dalla memoria, ma dalla comprensione.
5. **Risultato** (route `/risultato`). Il confronto `{ before, after, delta, migliorato }` per ogni concetto debole è l'evidenza *before/after* misurabile.

### Dove vive lo stato

Lo stato di sessione è **esternalizzato rispetto al client**: vive nel backend, in una `Map sessioni` in memoria, indicizzata da un `sessionId` generato da `/start`. Il frontend è stateless sul dominio — conserva solo il `sessionId` (in un signal in `AssessmentService`) e lo rispedisce a ogni chiamata. Questo rende il workflow **ispezionabile** (lo stato di una sessione è un singolo oggetto sul server) e **ripartibile fase per fase** (il client può passare da diagnosi a re-test riusando lo stesso `sessionId`). La cartella `state/` è predisposta per un'eventuale persistenza su file dello stato di sessione (già ignorata da git per i JSON, vedi `.gitignore`); la demo usa lo store in memoria, sufficiente allo scopo.

### Flusso agentico di sviluppo

```
        UTENTE / task
             │
             ▼
   ┌───────────────────┐   task cross-area   ┌──────────────────────────────┐
   │   orchestratore   │ ──── decompone ───► │ piano JSON: sotto-task        │
   │   (sonnet-4-5)    │      e delega       │ ordinati per dipendenza       │
   └───────────────────┘                     └──────────────────────────────┘
             │ delega ciascun sotto-task all'agente col dominio giusto
   ┌─────────┼───────────────┬───────────────┬────────────────────┐
   ▼         ▼               ▼               ▼                     ▼
 assessment  content        profilo        angular-developer
 -agent      -agent         -agent         (sonnet-4-5)
 (sonnet)    (sonnet)       (HAIKU)         │
 engine.js   content.js     engine.js*      app/frontend/
 (motore)    (item+lezioni) (profilo/       │  ogni UI creata/modificata
             │              before-after)   ▼
             │                          ┌──────────────────────┐
             │                          │ wcag-accessibility    │  ◄── gate HITL:
             │                          │ (revisione WCAG 2.2)  │      UI non "completa"
             │                          └──────────────────────┘      senza questa revisione
   * funzioni disgiunte da assessment-agent
```

## Scelte tecniche

- **Perché più sub-agenti invece di un unico prompt.** Il dominio ha aree con vincoli mutuamente incompatibili: il `content-agent` deve rispettare la "regola d'oro" (spiegare meccanismi, mai dare consigli finanziari) e non conosce l'algebra del motore; l'`assessment-agent` ragiona su IRT e informazione di Fisher e non deve toccare i testi. Un unico prompt che tenga insieme tutto sarebbe lungo, ambiguo e incline a modifiche fuori scope. Agenti separati con **domini esclusivi e output JSON espliciti** mantengono ogni responsabilità verificabile e impediscono a una modifica di propagarsi dove non deve (es. il contratto HTTP non cambia senza coordinamento esplicito con il frontend).

- **Model tiering.** La maggior parte degli agenti gira su `claude-sonnet-4-5` perché i loro task richiedono ragionamento algoritmico (motore IRT), progettazione di contenuto calibrato, o codice Angular idiomatico. Il **`profilo-agent` gira su `claude-haiku-4-5`**: i suoi task sono prevalentemente confronti di soglie e simulazioni di profili canonici — analisi meccaniche che non richiedono ragionamento profondo. Usare un modello più leggero dove basta riduce costo e latenza senza perdita di qualità (la motivazione è annotata nell'header dell'agente stesso).

- **Gestione errori, fallback e limiti di iterazione** (a runtime, nel motore):
  - **Limiti anti-loop / anti-noia:** la diagnosi è chiusa da tre condizioni indipendenti — tutti i concetti misurati (`σ ≤ SIGMA_MIN`), tetto `MAX_ITEM = 10`, o esaurimento degli item iniziali (`diagnosiFinita`).
  - **Reti di sicurezza:** se `prossimoItem` restituisce `null` (banca esaurita), `/next` chiude comunque la diagnosi con il profilo invece di andare in errore; se non ci sono concetti deboli, `/retest/start` restituisce direttamente un confronto vuoto.
  - **Validazione input:** `404` per `sessione non trovata`, `400` per `item non valido`; le risposte sono validate contro il flag `correct` lato server (mai inviato al client).
  - **Fallback di selezione:** se nessun concetto è ancora "da misurare", `prossimoItem` ripiega sul primo concetto; se il pool di un concetto è vuoto, usa l'intero pool candidati.
  - **Validazione simulata degli agenti:** ogni modifica del motore o delle soglie richiede la simulazione mentale di 3 profili canonici (principiante/esperto/misto) prima di essere considerata valida — un anti-regressione a monte.

- **Checkpoint di escalation umana (HITL).** Il gate di **accessibilità** è il punto di controllo del workflow: nessuna UI Angular è considerata completa finché il `wcag-accessibility` non l'ha revisionata (WCAG 2.2 AA) e i problemi bloccanti/alti non sono risolti. L'`angular-developer` è obbligato a delegare questa revisione prima di chiudere il lavoro — un controllo di qualità che un umano può ispezionare e approvare.

- **Stato esternalizzato e ispezionabile.** Tenere lo stato nel backend indicizzato da `sessionId` (invece che nel client) rende ogni sessione un oggetto singolo osservabile e permette di riprendere il workflow alla fase successiva senza rinegoziare tutto. La separazione `content.js` / `engine.js` (contenuto vs logica) è la stessa filosofia applicata al codice: `engine.js` importa gli item, non li duplica, così modificare una domanda non richiede mai di toccare la logica.

## Prerequisiti

- **Node.js** ≥ 20 (richiesto da Angular 22 e dall'ES module `--watch` del backend) e **npm** ≥ 9.
- Il **backend non richiede alcuna chiave API**: il motore di stima è deterministico e locale, non chiama alcun LLM a runtime.
- **Claude Code** con un account Anthropic autenticato serve *solo* per usare il team di agenti di sviluppo (`.claude/agents/`), non per eseguire l'app.
- Facoltativo: **Angular CLI** (`@angular/cli`) globale se preferisci il comando `ng`; altrimenti sono usati gli script npm locali. L'MCP `angular-cli` (`.mcp.json`) è usato dagli agenti di frontend.

## Setup

```bash
# 1. Clonare il repository
git clone https://github.com/MRinaldi9/hackathon.git
cd hackathon

# 2. Installare tutte le dipendenze (root + frontend + backend)
npm run install:all

# 3. Configurare le variabili d'ambiente del backend
cp app/backend/.env.example app/backend/.env
#   (facoltativo: cp .env.example .env nella root, stessi valori)
#   apri il file e verifica PORT e CORS_ORIGIN — i default vanno bene in locale

# 4. Avviare frontend + backend insieme
npm run dev
#   backend Fastify → http://localhost:3000
#   frontend Angular → http://localhost:4200  (con proxy verso :3000)
```

Poi apri **http://localhost:4200** nel browser.

Comandi utili:

| Comando | Effetto |
|---|---|
| `npm run dev` | Avvia backend (watch) + frontend in parallelo |
| `npm run dev:backend` | Solo backend Fastify (`node --watch`) |
| `npm run dev:frontend` | Solo frontend Angular (`ng serve`) |
| `npm run build` | Build di produzione del frontend |
| `npm test` | Esegue i test unitari del frontend (Vitest + jsdom) |

## Variabili d'ambiente

Definite in `app/backend/.env` (partendo da `app/backend/.env.example`). Non committare mai il file `.env` reale: è già in `.gitignore`.

| Variabile | Obbligatoria | Default | A cosa serve |
|---|---|---|---|
| `PORT` | No | `3000` | Porta su cui ascolta il backend Fastify |
| `CORS_ORIGIN` | No | `http://localhost:4200` | Origine consentita per le richieste CORS dal frontend. In produzione va impostata sull'URL reale del frontend |

Non esiste una variabile per chiavi API: l'app non ne ha bisogno a runtime.

## Come usarlo

Con il backend attivo su `:3000`, l'intero percorso è provabile via HTTP. Esempio dalla riga di comando:

```bash
# 1. Avvia una sessione → ricevi sessionId e il primo item
curl -s -X POST http://localhost:3000/start
# → {"sessionId":"k3f9x...","item":{"id":"bud_1","concetto":"budget",
#     "testo":"...","opzioni":[{"id":"a","testo":"..."},...]},"fase":"diagnosi"}

# 2. Rispondi a un item → ricevi il prossimo (o il profilo se la diagnosi è finita)
curl -s -X POST http://localhost:3000/next \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"k3f9x...","itemId":"bud_1","opzioneId":"b"}'
# → durante la diagnosi: {"esatto":true,"fase":"diagnosi","item":{...},"progresso":2}
# → a fine diagnosi:     {"esatto":...,"fase":"profilo","profilo":[...],
#                         "concettiDaRinforzare":["commissioni"],"lezioni":[...]}

# 3. Dopo le micro-lezioni, avvia il re-test
curl -s -X POST http://localhost:3000/retest/start \
  -H "Content-Type: application/json" -d '{"sessionId":"k3f9x..."}'

# 4. Rispondi al re-test → a fine re-test ricevi il confronto before/after
curl -s -X POST http://localhost:3000/retest \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"k3f9x...","itemId":"com_2","opzioneId":"c"}'
# → {"fase":"risultato","confronto":[
#     {"concetto":"commissioni","before":-0.62,"after":-0.28,"delta":0.34,"migliorato":true}]}
```

**Traccia demo consigliata** (profilo *forte sul budget, debole sulle commissioni*): rispondi correttamente agli item `budget`, sbaglia gli item `commissioni` → il sistema classifica `commissioni` come debole → sblocca la micro-lezione con intensità proporzionale → al re-test il `delta` di θ è positivo. È il caso d'uso che rende evidente il miglioramento misurabile davanti ai giudici.

Nell'uso via browser (`http://localhost:4200`) lo stesso flusso è guidato dall'interfaccia a gesture, fase dopo fase.

## Struttura del repository

```
hackathon/
├── README.md                     # questo documento
├── package.json                  # orchestratore npm (script dev/build/install)
├── .env.example                  # template variabili d'ambiente (root)
├── .mcp.json                     # server MCP angular-cli usato dagli agenti FE
│
├── .claude/
│   └── agents/                   # ► IL TEAM DI AGENTI DI SVILUPPO
│       ├── orchestratore.md      #   decompone e delega i task cross-area
│       ├── assessment-agent.md   #   motore IRT (engine.js)
│       ├── content-agent.md      #   banca item + micro-lezioni (content.js)
│       ├── profilo-agent.md      #   profilo + before/after (haiku)
│       ├── angular-developer.md  #   frontend Angular
│       └── wcag-accessibility.md #   gate accessibilità WCAG 2.2 AA
│
├── app/
│   ├── backend/                  # motore di stima — Fastify + ES modules
│   │   ├── .env.example
│   │   └── src/
│   │       ├── engine.js         #   motore IRT/Rasch + 4 endpoint Fastify
│   │       └── content.js        #   16 item (4 per concetto) + micro-lezioni
│   │
│   └── frontend/                 # Angular 22 standalone, signals, OnPush, tema arcade CABINET 07
│       ├── proxy.conf.json       #   proxy dev /start,/next,/retest → :3000
│       └── src/app/
│           ├── app.routes.ts     #   diagnosi → profilo → retest → risultato
│           ├── services/
│           │   └── assessment.service.ts  # fonte di verità dei tipi + client HTTP
│           └── pages/
│               ├── diagnosi/     #   fase 1: assessment adattivo a gesture
│               ├── profilo/      #   fase 2: profilo + micro-lezioni
│               ├── retest/       #   fase 3: verifica finale
│               ├── risultato/    #   fase 4: confronto before/after
│               └── shared/trivio/#   componente condiviso del percorso
│
├── docs/                         # documentazione di progetto e deliverable
│   ├── progetto-inclusione-finanziaria.md  # architettura estesa + motore IRT
│   ├── deliverable-tema.md       #   i 3 deliverable richiesti dal tema
│   ├── engine.js / content.js    #   copie di riferimento del backend
│
├── state/                        # predisposta per persistenza sessioni (JSON ignorati)
└── presentation/                 # materiale di presentazione
```

Per l'approfondimento sul motore di stima (formula di Rasch, taratura dei parametri, metodologia before/after) vedi **[`docs/progetto-inclusione-finanziaria.md`](docs/progetto-inclusione-finanziaria.md)**; per i deliverable del tema vedi **[`docs/deliverable-tema.md`](docs/deliverable-tema.md)**.
