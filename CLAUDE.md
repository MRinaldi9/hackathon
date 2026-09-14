# CLAUDE.md — Hagenthon / Inclusione Finanziaria

Guida operativa per lavorare su questo repository. Contiene solo informazioni
ricavate dal codice reale (path, nomi e valori effettivi).

---

## 1. Overview

**Hagenthon — Inclusione Finanziaria** (interno: "FinFlow") è una web app che
insegna ai teenager (15–20 anni) a riconoscere i **meccanismi finanziari
nascosti** — costi ricorrenti, interesse composto, commissioni, budget —
attraverso un mini-gioco arcade.

Il flusso è un **assessment adattivo**: una **diagnosi** (test iniziale che
stima la competenza per concetto con un modello IRT), un **profilo** di
competenza con **micro-lezioni** mirate sui concetti deboli, un **re-test** su
item mai visti, e un **risultato** con confronto **before/after** che dimostra
il miglioramento.

Vincolo di dominio (**"regola d'oro"**): il contenuto spiega *meccanismi*, non
dà **mai** consigli finanziari (niente "risparmia", "non fare abbonamenti").

> Nota: l'app a runtime **non usa LLM né chiavi API**. Il motore di stima è
> deterministico e locale. Gli "agenti" del progetto sono i sub-agenti di
> Claude Code definiti in `.claude/agents/` (usati in fase di sviluppo).

---

## 2. Stack tecnico

**Monorepo** orchestrato da un `package.json` di root con `concurrently`.

### Backend — `app/backend/`
- **Node.js ESM** (`"type": "module"`)
- **Fastify** `^4.27.0` + **@fastify/cors** `^9.0.1`
- Nessun database: **stato in memoria** (`Map` di sessioni)
- Dev con `node --watch` (nessun transpiler, JS puro)

### Frontend — `app/frontend/`
- **Angular** `^22.1.6` — **standalone components**, **zone.js** `~0.15.1`
- **RxJS** `~7.8.0`, **TypeScript** `~6.0.3` (target/module **ES2022**)
- **SCSS** (design system in `src/styles.scss`)
- Angular CLI `^22.1.8`, builder `@angular/build:application`
- Test runner: **Vitest** `^4` + jsdom (integrato in `@angular/build:unit-test`)
- Dev server con **proxy** verso il backend (`proxy.conf.json`)

### Tooling agentico
- `.mcp.json` → MCP server **angular-cli** (`npx -y @angular/cli mcp`)
- `.claude/agents/` → 6 sub-agenti (vedi §5)

---

## 3. Struttura del progetto

```
hackathon/
├── package.json              # Root: orchestratore npm (concurrently backend+frontend)
├── README.md                 # Documentazione utente/giudici
├── CLAUDE.md                 # Questo file
├── .env.example              # Template variabili d'ambiente (root)
├── .gitignore                # Esclude .env, node_modules, dist, package-lock.json
├── .mcp.json                 # MCP: angular-cli
│
├── app/
│   ├── backend/              # Motore di stima (Fastify + IRT)
│   │   ├── package.json      # scripts: start / dev (node --watch)
│   │   ├── .env.example      # PORT, CORS_ORIGIN
│   │   └── src/
│   │       ├── engine.js     # Motore IRT + endpoint Fastify  ← file critico
│   │       └── content.js    # Banca item (16) + micro-lezioni ← file critico
│   │
│   └── frontend/             # Angular standalone (il mini-gioco)
│       ├── angular.json      # style=scss, standalone, budget, proxy in serve
│       ├── tsconfig.json     # strict + strictTemplates
│       ├── proxy.conf.json   # /start /next /retest → http://localhost:3000
│       └── src/
│           ├── main.ts       # bootstrapApplication (router, http, animations)
│           ├── index.html
│           ├── styles.scss   # Design system (token --color-* e --cb-*)
│           └── app/
│               ├── app.component.ts   # solo <router-outlet/>
│               ├── app.routes.ts      # route lazy per fase
│               ├── services/
│               │   └── assessment.service.ts  # wrapper HTTP + tipi condivisi
│               └── pages/
│                   ├── diagnosi/    # fase 1 — test adattivo (home '')
│                   ├── profilo/     # fase 2 — profilo + micro-lezioni
│                   ├── retest/      # fase 3 — verifica finale
│                   ├── risultato/   # fase 4 — confronto before/after
│                   └── shared/
│                       └── trivio/  # TrivioComponent condiviso (diagnosi+retest)
│
├── .claude/agents/           # Sub-agenti Claude Code (dev-time)
├── docs/                     # deliverable-tema.md, progetto-*.md + copie di engine/content
├── agents/                   # Copie mirror di alcuni agenti/skill (vedi §11)
├── presentation/             # (vuota) — materiale presentazione
└── state/                    # (vuota) — predisposta per stato esternalizzato
```

---

## 4. Comandi principali

### Root (`hackathon/`)
| Comando | Cosa fa |
|---|---|
| `npm run install:all` | Installa dipendenze root + frontend + backend |
| `npm run dev` | Avvia **backend e frontend insieme** (concurrently, watch) |
| `npm start` | Come `dev` ma con gli script `start:*` |
| `npm run build` | Alias di `build:frontend` |
| `npm run dev:backend` / `dev:frontend` | Avvia solo uno dei due (watch) |
| `npm run start:backend` / `start:frontend` | Avvia solo uno dei due |

### Backend (`app/backend/`)
| Comando | Cosa fa |
|---|---|
| `npm start` | `node src/engine.js` (porta da `PORT`, default 3000) |
| `npm run dev` | `node --watch src/engine.js` (ricarica sui cambi) |

### Frontend (`app/frontend/`)
| Comando | Cosa fa |
|---|---|
| `npm start` | `ng serve` (porta 4200, proxy attivo) |
| `npm run build` | `ng build` (default config **production**) |
| `npm run watch` | `ng build --watch --configuration development` |

> Verifica build in dev: `npx ng build --configuration development`.

---

## 5. Architettura e pattern

### Flusso runtime (end-to-end)
```
[Angular :4200]  --proxy-->  [Fastify :3000]
   diagnosi   POST /start        → sessionId + primo item (fase 'diagnosi')
              POST /next         → prossimo item OPPURE profilo+lezioni (fase 'profilo')
   profilo    (router state)     → mostra profilo + micro-lezioni, poi naviga /retest
   retest     POST /retest/start → primo item di verifica (fase 'retest')
              POST /retest       → prossimo item OPPURE confronto (fase 'risultato')
   risultato  (router state)     → before/after
```

- **Motore IRT (Rasch 1PL)** in `engine.js`: `pCorretto = 1/(1+e^-(theta-difficolta))`.
  Selezione item per **massima informazione di Fisher** (item con `|p-0.5|` minima)
  sul concetto più incerto (`sigma` più alta).
- **Stato per sessione**: `Map` in memoria indicizzata da `sessionId`
  (stringa random). Ogni sessione tiene `abilita[concetto] = {theta, sigma, risposte}`,
  `serviti`, `contatore`, e (dopo il profilo) `before`, `concettiDeboli`.
- **Fasi item disgiunte**: `fase: 'iniziale'` (diagnosi) vs `fase: 'finale'`
  (re-test). Il re-test usa item **mai visti** → misura comprensione, non memoria.
- **Frontend a fasi**: una route per fase, componenti **standalone** lazy-loaded.
  I dati tra pagine passano via **router state** (`state:{...}`), letti con
  `getCurrentNavigation()?.extras?.state` **e** fallback su `history.state`.
- **Servizio condiviso**: `AssessmentService` (`providedIn: 'root'`) incapsula le
  chiamate HTTP e conserva il `sessionId` in un **signal**.
- **Componente presentazionale condiviso**: `TrivioComponent` (`shared/trivio/`)
  rende domanda + destinazioni + avatar animato; **non contiene scoring**, emette
  `scelta(opzioneId)` e il parent gestisce il backend.

### Parametri del motore (in `engine.js`)
| Costante | Valore | Significato |
|---|---|---|
| `K` | `0.7` | tasso di apprendimento update di theta (tarato a simulazione) |
| `THETA0` | `0.0` | stima iniziale |
| `SIGMA0` | `1.0` | incertezza iniziale |
| `SIGMA_MIN` | `0.55` | soglia sotto cui un concetto è "misurato" |
| `MAX_ITEM` | `10` | tetto item per non annoiare |
| soglie livello | `theta ≥ 0.3` forte, `≤ -0.3` debole, altrimenti medio |

### Contenuto (`content.js`)
- **16 item**, 4 per concetto. Concetti: `costi_ricorrenti`, `interesse_composto`,
  `commissioni`, `budget`.
- Difficoltà assegnata a mano su scala `-2` (facile) .. `+2` (difficile).
- Ogni item ha `opzioni[]` con un solo `correct: true`; `spedibile()` **rimuove
  la soluzione** prima di inviare al frontend.
- Micro-lezioni in 3 intensità (`fondamenta`/`rinforzo`/`cenno`), scelte da
  `scegliLezione(concetto, theta)`.

---

## 6. Convenzioni di codice

- **Lingua**: commenti, testi, contenuti e **messaggi di commit** in **italiano**
  (commit: prefisso convenzionale inglese `feat:`/`docs:`/`chore:` + descrizione
  italiana).
- **Angular**: SEMPRE **standalone components** (`standalone: true`), **SCSS**,
  `prefix: app`. Preferire **`ChangeDetectionStrategy.OnPush`** e **signals**
  (come in `AssessmentService` e `TrivioComponent`). DI con `inject()`.
- **Template**: control flow moderno **`@if` / `@for`** (con `track`), non
  `*ngIf`/`*ngFor`.
- **File dei componenti**: tripletta `*.component.ts` / `.html` / `.scss` nella
  cartella della pagina; selettori `app-<nome>`.
- **Tipi condivisi FE**: definiti e importati da `assessment.service.ts`
  (`Item`, `Opzione`, `VoceProfilo`, `Lezione`, `Confronto`, `Risposta*`).
- **Backend JS**: ESM (`import`/`export`), niente TypeScript, niente build step.
- **Naming di dominio in italiano** anche nel codice (`prossimoItem`, `aggiorna`,
  `concettiDeboli`, `spedibile`).
- **Design system**: usare i **token CSS esistenti** in `styles.scss` — palette
  chiara `--color-*`/`--space-*`/`--radius-*` e tema arcade `--cb-*` (usato dentro
  `.arcade-root` / `.game-root`). Non introdurre colori/font nuovi.

---

## 7. Variabili d'ambiente

Definite solo per il **backend** (`app/backend/.env`, template in
`app/backend/.env.example` e nel root `.env.example`). Il frontend non usa env:
in dev passa dal `proxy.conf.json`.

| Variabile | Default | Usata in | Descrizione |
|---|---|---|---|
| `PORT` | `3000` | `engine.js` (`app.listen`) | porta del backend Fastify |
| `CORS_ORIGIN` | `http://localhost:4200` | `engine.js` (`cors`) | origine consentita per CORS |

Nessuna `ANTHROPIC_API_KEY` o segreto è richiesto a runtime.

---

## 8. File critici

| File | Perché conta |
|---|---|
| `app/backend/src/engine.js` | Cuore del sistema: modello IRT, selezione adattiva, endpoint, stato sessioni |
| `app/backend/src/content.js` | Banca item + micro-lezioni; qualsiasi cambio di contenuto passa da qui |
| `app/frontend/src/app/services/assessment.service.ts` | Contratto FE↔BE e tipi condivisi |
| `app/frontend/src/app/app.routes.ts` | Mappa delle fasi (route lazy) |
| `app/frontend/src/app/pages/shared/trivio/trivio.component.ts` | Componente di gioco condiviso diagnosi/retest |
| `app/frontend/src/styles.scss` | Design system (token e primitivi `.arcade-*`) |
| `app/frontend/proxy.conf.json` | Instrada le chiamate API in dev |
| `package.json` (root) | Orchestrazione dei due processi |

---

## 9. Decisioni architetturali

- **Stato in memoria, non DB**: sufficiente per la demo; le sessioni vivono nella
  `Map` di `engine.js`. La cartella `state/` è predisposta ma non usata.
- **JS puro sul backend** (niente TS/build): motore semplice e deterministico,
  avvio immediato con `node --watch`.
- **Router state invece di uno store globale** per passare profilo/confronto tra
  pagine (con fallback `history.state`): niente dipendenze extra.
- **Item a fasi disgiunte** (`iniziale`/`finale`): garantisce che il re-test
  misuri comprensione e non memoria — è il fondamento dell'evidenza before/after.
- **Soluzione mai inviata al client** (`spedibile()`): il `correct` resta sul server.
- **Model tiering degli agenti** (dev-time): `profilo-agent` gira su
  `claude-haiku-4-5` (compito più leggero), gli altri su `claude-sonnet-4-5`.
- **Separazione stretta degli agenti**: ognuno possiede un dominio esclusivo
  (vedi §5 sotto) per evitare sovrapposizioni.

---

## 10. Cose da NON fare

- ❌ **Non committare `.env`** (è in `.gitignore`): solo `.env.example`.
- ❌ **Non inserire consigli finanziari** negli item/lezioni: la risposta corretta
  deve dimostrare **comprensione del meccanismo** ("regola d'oro" in `content.js`).
- ❌ **Non aggiungere chiamate LLM/API nel motore**: il backend è deterministico.
- ❌ **Non toccare lo scoring quando modifichi la UI**: es. `TrivioComponent` è
  presentazionale; la logica resta nei parent (`scegli()`/`gestisciRisposta`).
- ❌ **Non introdurre `NgModule`**: il progetto è interamente standalone.
- ❌ **Non usare `*ngIf`/`*ngFor`**: usare `@if`/`@for` con `track`.
- ❌ **Non aggiungere endpoint backend senza aggiornare `proxy.conf.json`**
  (attualmente instrada `/start`, `/next`, `/retest` → `:3000`; il prefisso
  `/retest` copre anche `/retest/start`).
- ❌ **Non regredire l'accessibilità**: mantenere gestione del focus, ARIA
  (`role`, `aria-pressed`, `aria-live`), target ≥ 44px e fallback
  `prefers-reduced-motion` (rivedibili con l'agente `wcag-accessibility`).
- ❌ **Non superare i budget di build**: `anyComponentStyle` warning 30kb / error
  50kb, initial warning 500kb / error 1mb (`angular.json`). I budget dei componenti
  sono stati rilassati dopo l'introduzione del tema arcade CABINET 07 — TILT.
- ❌ **Non violare la separazione degli agenti**: `content-agent` tocca solo
  `content.js`, `assessment-agent` solo `engine.js`, `profilo-agent` solo
  profilo/before-after.

---

## 11. Note aggiuntive

### Sub-agenti (`.claude/agents/`)
| Agente | Modello | Dominio esclusivo |
|---|---|---|
| `orchestratore` | sonnet-4-5 | decompone task cross-layer, delega (non scrive codice) |
| `assessment-agent` | sonnet-4-5 | motore IRT in `engine.js` (parametri, selezione, endpoint) |
| `content-agent` | sonnet-4-5 | banca item e micro-lezioni in `content.js` |
| `profilo-agent` | **haiku-4-5** | soglie profilo, selezione lezioni, evidenza before/after |
| `angular-developer` | sonnet-4-5 | frontend Angular (componenti, servizi, routing, stili) |
| `wcag-accessibility` | (non specificato) | revisione WCAG 2.2 AA; invocato da `angular-developer` |

### Duplicazioni da tenere presenti
- Esistono **due copie** degli agenti/skill: quelle attive in `.claude/agents/` e
  `.claude/skills/`, e copie mirror in `agents/` (incluse `agents/hackathon-*`).
  Le versioni autorevoli per Claude Code sono quelle sotto `.claude/`.
- `docs/engine.js` e `docs/content.js` sono **copie** dei sorgenti backend a scopo
  documentale: la fonte di verità è `app/backend/src/`.

### Git / branch
- Branch principale (e corrente): `main`. La `feature/fe-design-system` è stata
  mergiata (PR #4) e include il tema arcade CABINET 07 — TILT su tutte le fasi.
- `package-lock.json` è **in `.gitignore`** (scelta del progetto): non forzarne il
  commit.

### Avvio rapido
```bash
npm run install:all
npm run dev            # backend :3000 + frontend :4200
# apri http://localhost:4200
```
