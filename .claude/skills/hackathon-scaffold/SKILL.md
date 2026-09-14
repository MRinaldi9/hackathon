---
name: hackathon-scaffold
description: Genera la struttura completa di un progetto web app agentico per l'hackathon. Usala nella prima fase, dopo aver deciso il tema. Crea le cartelle, i file base, .env.example, .gitignore, lo schema dello stato condiviso tra agenti, e la cartella .claude/agents/ con i sub-agenti auto-avvianti dell'applicazione. Invocala con "/hackathon-scaffold" o quando l'utente chiede di impostare la struttura del progetto, lo scaffold, o l'architettura iniziale.
when_to_use: Nella prima fase dell'hackathon, subito dopo aver definito il tema e gli agenti, per creare l'impalcatura del progetto e i sub-agenti dell'app.
context: fork
background: false
---

# Scaffold del progetto agentico

Genera l'impalcatura completa di una web app agentica per l'hackathon. Il tuo obiettivo è creare una struttura che comunichi da sé la profondità architetturale: un orchestratore, sub-agenti specializzati con definizioni auto-avvianti, stato esternalizzato, e una separazione netta delle responsabilità.

**Lingua:** tutti i commenti nel codice, i nomi dei file di documentazione e qualsiasi testo che scrivi devono essere in **italiano**. I nomi di variabili, funzioni, cartelle tecniche e le keyword restano in inglese secondo la prassi universale; i commenti che li accompagnano sono in italiano.

## Prima di iniziare

Se non è già chiaro dalla conversazione, chiedi all'utente il tema dell'app e l'elenco dei sub-agenti che ha in mente (orchestratore più 2-4 specializzati). Non procedere alla cieca: la struttura dei sub-agenti dipende da questa informazione.

Chiedi anche quale stack preferisce per la web app se non l'ha detto. Un'opzione solida e rapida da mettere in piedi in 4 ore è un backend Python (FastAPI) con l'SDK di Claude, e un frontend leggero. Ma adattati a ciò che l'utente conosce meglio.

## Struttura da creare

Crea una struttura di questo tipo, adattandola al tema e allo stack scelti. L'esempio usa Python; adatta i nomi al dominio reale del progetto.

```
progetto/
├── .claude/
│   └── agents/                    # sub-agenti auto-avvianti dell'app
│       ├── orchestratore.md
│       ├── <sub-agente-1>.md
│       ├── <sub-agente-2>.md
│       └── <sub-agente-3>.md
├── src/
│   ├── orchestrator.py            # coordina i sub-agenti e il workflow
│   ├── agents/                    # implementazione dei sub-agenti
│   │   ├── __init__.py
│   │   └── <sub_agente>.py
│   ├── state/                     # gestione dello stato esternalizzato
│   │   └── store.py
│   └── config.py                  # configurazione, model tiering, env
├── state/                         # file di stato persistente (JSON)
│   └── .gitkeep
├── web/                           # interfaccia web
│   └── index.html
├── .env.example                   # template delle variabili d'ambiente
├── .gitignore
├── requirements.txt
└── README.md                      # segnaposto, riempito da hackathon-readme
```

## Principi architetturali da rispettare

Mentre generi i file, rispetta questi principi, perché sono ciò che rende il sistema davvero agentico e non un wrapper:

- **Separazione orchestratore / sub-agenti.** L'orchestratore non fa il lavoro: decompone il compito, decide quale sub-agente invocare, passa lo stato e raccoglie i risultati. I sub-agenti fanno un lavoro specializzato e restituiscono output strutturati.
- **Stato esternalizzato.** Lo stato condiviso vive in file (JSON nella cartella `state/`), non solo in memoria. Questo rende il workflow ispezionabile, ripartibile, e persistente tra i passi. Definisci uno schema chiaro dello stato.
- **Output strutturati.** I sub-agenti restituiscono dati strutturati (JSON con uno schema definito), non testo libero, così l'orchestratore può ragionarci sopra in modo affidabile.
- **Workflow multi-step.** Il flusso attraversa più passi coordinati, con lo stato che avanza da uno all'altro.

## File chiave da generare con cura

**`.gitignore`** — deve includere assolutamente `.env`, `__pycache__/`, `*.pyc`, `venv/`, `.venv/`, `node_modules/`, e i file di stato temporanei se contengono dati sensibili. Questo è critico: evita che segreti finiscano nel repository.

**`.env.example`** — elenca tutte le variabili d'ambiente necessarie (per esempio `ANTHROPIC_API_KEY`) con valori segnaposto, mai valori reali. Aggiungi un commento in italiano su ciascuna.

**`src/config.py`** — centralizza la configurazione, incluse le scelte di model tiering. Prepara qui la mappatura dei modelli ai compiti (per esempio un modello leggero per la classificazione, uno più capace per il ragionamento), con commenti in italiano che spiegano il criterio. Carica i segreti dalle variabili d'ambiente, mai hardcoded.

**`src/state/store.py`** — implementa la lettura e scrittura dello stato esternalizzato su file, con uno schema chiaro. Gestisci il caso del file mancante.

**`src/orchestrator.py`** — l'ossatura dell'orchestratore: il loop che decompone il compito, invoca i sub-agenti in sequenza o in parallelo, aggiorna lo stato. Anche se all'inizio è uno scheletro, la struttura deve mostrare chiaramente l'intento agentico.

## I sub-agenti auto-avvianti in `.claude/agents/`

Questa è una parte distintiva. Crea in `.claude/agents/` un file markdown per ogni agente dell'applicazione, così che chiunque apra il repo (o Claude Code stesso) trovi i sub-agenti già definiti e pronti a partire. Ogni file segue il formato dei sub-agenti di Claude Code: frontmatter YAML con `name`, `description`, `tools`, `model`, e un corpo che è il system prompt.

Esempio di struttura di un file sub-agente (adatta al dominio reale):

```markdown
---
name: nome-sub-agente
description: Descrizione chiara e specifica di quando questo agente va usato. Usa "in modo proattivo" per incoraggiare la delega automatica.
tools: Read, Grep, Glob
model: haiku
---

Sei un agente specializzato in [compito specifico].

Quando vieni invocato:
1. [primo passo]
2. [secondo passo]

Restituisci sempre l'output in questo formato:
[schema dell'output strutturato]

Vincoli:
- [cosa non devi fare]
- [limiti di scope]
```

Assegna a ogni sub-agente il modello giusto per il suo compito: un modello leggero per compiti semplici e ripetitivi, uno più capace dove serve ragionamento. Limita i `tools` a quelli che ciascun agente usa davvero. Scrivi le `description` in modo specifico così l'orchestratore sa quando delegare a ciascuno.

Nota importante sui contenuti: la vera implementazione dei system prompt degli agenti verrà raffinata dalla skill `hackathon-agents`. Qui crea le definizioni di base ben strutturate; l'utente le approfondirà nel passo successivo.

## Al termine

Quando hai finito, riepiloga all'utente in italiano cosa hai creato: la struttura, i file chiave, e i sub-agenti definiti. Poi suggerisci il commit e ricorda di verificare che `.env` sia nel `.gitignore` prima di pushare:

- `git init` (se non ancora fatto)
- `git add -A`
- `git commit -m "chore: scaffold iniziale del progetto con architettura ad agenti"`
- `git push`

Infine indica il passo successivo: raffinare i system prompt degli agenti con `/hackathon-agents`.
