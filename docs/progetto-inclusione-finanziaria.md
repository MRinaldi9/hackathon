# Progetto Hagenthon — Inclusione Finanziaria per adolescenti

> Documento di sintesi per il team. Raccoglie l'idea, le decisioni chiave e la logica del motore di stima. Da usare come base per la demo e la presentazione finale.

---

## 1. Il tema e i vincoli

Stiamo sviluppando sul **Tema 02 — Inclusione Finanziaria** dell'hackathon (Accenture, agentic coding, team da 2, 5 ore di sviluppo).

L'obiettivo del tema: usare strumenti di agentic coding per supportare l'**educazione alla finanza personale di base**, aiutando persone con bassa alfabetizzazione finanziaria a comprendere concetti e gestire meglio le proprie finanze quotidiane.

Vincoli e paletti che dobbiamo rispettare:

- Serve una **capability software concreta**, non solo un chatbot che riscrive testi.
- Serve un **miglioramento misurabile** (before/after) nella comprensione dell'utente.
- **Vietato** dare raccomandazioni di investimento o consulenza finanziaria personalizzata.
- **Vietato** semplificare in modo che cambi il significato originale.
- L'uso dell'AI deve essere **spiegabile dal team**.

Deliverable richiesti dal tema: User Difficulty Statement, Before/After Simplicity Evidence, Risk & Clarity Note.

---

## 2. Il target: adolescenti 15-20 anni

Abbiamo scelto di targettare i **15-20 anni**. È l'età giusta per l'educazione finanziaria: iniziano a gestire denaro proprio (paghetta, primo lavoretto, prima carta, abbonamenti) ma la scuola non insegna quasi nulla di pratico. Il problema è reale e sentito.

La sfida di design con questo target: i teenager scappano dai quiz in stile scolastico. Qualsiasi cosa somigli a un'interrogazione viene abbandonata. Questo ha guidato la decisione centrale del progetto.

---

## 3. L'idea centrale: assessment invisibile + percorso adattivo

L'utente entra in una **simulazione di un mese di vita** dove prende decisioni tramite gesture veloci (swipe / tap / drag). Ogni decisione è in realtà un **item diagnostico** che misura silenziosamente la comprensione di un concetto finanziario. Non ci sono domande a risposta multipla in stile scuola: ci sono situazioni reali risolte con gesti immediati e conseguenze visibili.

Dietro le quinte gira un **motore di stima del livello** (adaptive testing semplificato): ogni scelta aggiorna una stima di competenza per ciascun concetto, e le situazioni successive si adattano. Alla fine il sistema ha un **profilo di competenza** e sblocca solo le micro-lezioni sui concetti dove l'utente è debole.

### Perché questa idea vince sul tema

| Requisito del tema | Come lo soddisfiamo |
|---|---|
| Capability software concreta | Il motore adattivo che valuta e personalizza — non solo testo riscritto |
| Miglioramento misurabile (before/after) | Livello stimato all'inizio → concetti padroneggiati alla fine, verificabile con re-test |
| Niente consulenza finanziaria | Insegniamo *concetti* ("cos'è un rinnovo automatico"), non diciamo mai *cosa comprare* |
| AI spiegabile | La logica del motore è semplice e documentata (vedi sezione 6) |

### Il flusso completo dell'esperienza

1. **Hook iniziale** — l'utente entra nella simulazione (niente schermata "inizia il quiz").
2. **Simulazione di vita** — scelte via swipe / tap / drag; ogni scelta = 1 item diagnostico.
3. **Motore di stima (nascosto)** — aggiorna il livello per ogni concetto e adatta le scelte successive.
4. **Profilo di competenza** — forte / debole per ciascun concetto.
5. **Micro-lezioni mirate** — solo sui concetti deboli.
6. **Verifica finale** — re-test sui concetti insegnati = evidenza before/after.

---

## 4. I concetti finanziari coperti

Ancoriamo tutto a scenari di vita di un 15-20enne. La banca contiene **16 item, 4 per concetto**, con difficoltà scalate (da -2 = facilissimo a +2 = difficilissimo) all'interno di ciascun concetto. I concetti:

- **costi_ricorrenti** — abbonamenti auto-rinnovanti, spese ricorrenti nel tempo
- **interesse_composto** — risparmio e debito che crescono nel tempo
- **budget** — entrate vs uscite, pianificare un obiettivo di risparmio
- **commissioni** — costi nascosti, confronto tra offerte con spese diverse

Espandibile facilmente (es. TAEG, inflazione, "compra ora paga dopo").

**Divisione degli item in due fasi.** Ogni item è marcato come `fase: 'iniziale'` o `fase: 'finale'`. I 4 item di un concetto si dividono in **2 per la diagnosi** (test iniziale) e **2 per il re-test** (test finale), coprendo in ciascun gruppo un item facile e uno difficile. Questa separazione è essenziale: il re-test deve usare item **mai visti** nella diagnosi, altrimenti misurerebbe la memoria dell'utente invece della sua comprensione. Con 2 item riservati alla verifica, il confronto before/after è affidabile (verificato in simulazione).

### Come sono camuffati gli item

Esempio di item diagnostico camuffato:

> *"Un'app ti offre 3 mesi gratis, poi 9,99 €/mese in automatico. Cosa succede al 4° mese se non fai nulla?"*

Misura la comprensione di **abbonamenti auto-rinnovanti e costi ricorrenti**, ma sembra una scelta di vita, non una domanda d'esame.

### Regola d'oro per gli item (rispetto del tema)

La risposta "giusta" di ogni item deve dimostrare **comprensione di un meccanismo**, MAI dare un consiglio.

- ✅ Giusto: "l'abbonamento ti addebita 9,99 € ogni mese" (capisci il meccanismo)
- ❌ Sbagliato: "non fare mai abbonamenti" (è un consiglio finanziario, vietato dal tema)

Questo ci tiene puliti rispetto al divieto di consulenza. **Da dire esplicitamente ai giudici.**

### Le micro-lezioni adattive

Una micro-lezione per concetto, ma con **tre varianti di intensità** scelte in base a *quanto* l'utente è debole:

- **fondamenta** (θ molto basso, ≤ -1.0) → spiegazione dalle basi
- **rinforzo** (θ vicino alla soglia, ≤ -0.3) → ripasso rapido
- **cenno** (θ ok ma non forte) → solo un promemoria

Ogni variante è breve e visiva (adatta a un teenager): titolo, idea in una frase, esempio con numeri concreti, takeaway. Un utente forte su un concetto **non riceve alcuna lezione** su quel concetto: il sistema non gli fa perdere tempo.

> Questo è il livello di adattività che i giudici premiano: non "hai sbagliato, ecco la lezione", ma "quanto hai sbagliato determina *quanta* lezione ricevi". La selezione della variante è coerente con le soglie del motore, così contenuto e logica non vanno mai fuori sincrono.

---

## 5. Stack tecnico

Stack scelto: **Angular** (frontend) + **Fastify** (backend).

Il backend espone due endpoint (`POST /start` e `POST /next`) e ospita il motore di stima. Quando la diagnosi finisce, `/next` restituisce già il profilo di competenza **e le micro-lezioni pronte** (con l'intensità giusta) per i concetti deboli, così il frontend non deve fare logica aggiuntiva. Il frontend gestisce la simulazione con le gesture, l'animazione delle conseguenze, la schermata del profilo e le micro-lezioni.

---

## 6. I file del progetto

Panoramica di cosa contiene ogni file, così è chiaro dove mettere le mani.

| File | Cosa contiene | Quando toccarlo |
|---|---|---|
| **`content.js`** | Fonte unica di verità per il **contenuto**: i 16 item (domande + opzioni + difficoltà) e le micro-lezioni con le tre varianti di intensità. Esporta `ITEMS`, `LEZIONI` e la funzione `scegliLezione()`. | Ogni volta che si aggiunge, modifica o ricalibra una domanda o una lezione. È l'unico file da editare per il contenuto. |
| **`engine.js`** | Solo la **logica**: il motore di stima (formula IRT, aggiornamento di θ, selezione adattiva del prossimo item), la costruzione del profilo e i due endpoint Fastify. Importa gli item da `content.js` — non li duplica. | Per cambiare il comportamento del motore (parametri `K`, soglie, criterio di fine diagnosi) o gli endpoint. |
| **`progetto-inclusione-finanziaria.md`** | Questo documento: idea, decisioni prese e loro motivazioni, logica del motore, cosa evitare, prossimi passi. Serve per allineare il team e preparare il pitch. | Quando cambia una decisione di progetto o si completa un pezzo, per tenerlo allineato al codice. |
| **`deliverable-tema.md`** | I 3 deliverable richiesti esplicitamente dal tema: User Difficulty Statement, Before/After Simplicity Evidence, Risk & Clarity Note. Pronti da inserire nelle slide. | Quando cambia il contenuto o il caso d'uso mostrato (es. dopo aver implementato il re-test, per mostrare il salto di θ dal vivo). |

**Come si collegano:** `engine.js` fa `import { ITEMS, scegliLezione } from './content.js'`. Il contenuto sta tutto da una parte, la logica dall'altra. Modificare una domanda non richiede mai di aprire `engine.js`.

---

## 7. Il motore di stima (il cuore tecnico)

Questo è il pezzo che rende il progetto difendibile. È ciò che trasforma "un altro chatbot educativo" in una vera capability software.

### Il principio

Il problema: l'utente fa scelte (osservabili), noi vogliamo stimare quanto padroneggia ciascun concetto (non osservabile). Questo è il problema che risolve la **teoria della risposta all'item (IRT)** — la stessa famiglia di modelli dietro i test adattivi tipo GRE o le prove INVALSI.

Idea di fondo: *la probabilità che l'utente risponda correttamente a un item dipende dalla differenza tra la sua abilità e la difficoltà dell'item.* Se abilità ≫ difficoltà, quasi certamente risponde bene; se abilità ≪ difficoltà, quasi certamente sbaglia; quando sono vicine è 50-50 — e **quelle sono le domande che danno più informazione**. Ecco perché un test adattivo converge in fretta.

### Il modello dei dati

Tre entità:

- **Item** — ha un `concetto`, una `difficolta` (scala continua da -2 = facilissimo a +2 = difficilissimo, assegnata a mano), e le `opzioni` con flag di correttezza.
- **Concetto** — le aree di competenza (costi_ricorrenti, budget, ecc.).
- **Stato utente** — per ogni concetto: una stima di abilità `theta` (θ, parte da 0 = neutro) e un `sigma` (σ, quanto siamo incerti; parte alto e si stringe con le risposte).

> Il `sigma` è la parte che quasi nessun team all'hackathon avrà. Non teniamo solo un punteggio: modelliamo anche la nostra **confidenza** nella stima.

### La formula (modello di Rasch / IRT 1PL)

Probabilità di risposta corretta:

```
P(corretto) = 1 / (1 + e^(-(θ - d)))
```

- Quando θ = d → esponente 0 → P = 0.5 (cinquanta e cinquanta)
- Quando θ ≫ d → P tende a 1
- Quando θ ≪ d → P tende a 0

### L'aggiornamento dopo ogni risposta

Un passo di discesa del gradiente sulla verosimiglianza:

```
errore  = (risposta_reale) - P(corretto)     # risposta_reale = 1 se giusto, 0 se sbagliato
θ_nuovo = θ_vecchio + K · errore              # K = tasso di apprendimento
```

Intuizione: se il sistema si aspettava una risposta giusta (P alto) e l'utente sbaglia, `errore` è molto negativo e θ scende parecchio — **una sorpresa sposta molto la stima**. Se sbaglia un item che ci si aspettava sbagliasse comunque (P basso), θ si muove appena.

> È lo stesso principio dell'update **Elo** negli scacchi. Dirlo ai giudici dà credibilità immediata.

### La selezione del prossimo item

L'informazione (di Fisher) è massima quando P = 0.5. Quindi:

1. Scegliamo il **concetto più incerto** (σ più alto, ancora non "misurato").
2. Dentro quel concetto, scegliamo l'item la cui difficoltà rende la risposta più vicina a **50-50** per il θ stimato dell'utente.

### Quando finisce la diagnosi

La fase diagnostica termina quando: tutti i concetti sono "misurati" (σ sotto una soglia), OPPURE si raggiunge un tetto di item (per non annoiare), OPPURE gli item di fase iniziale sono esauriti.

Poi si costruisce il **profilo**: per ogni concetto, `theta` → livello forte / medio / debole.

### La verifica finale (re-test) e l'evidenza before/after

Dopo le micro-lezioni, una fase di **re-test** misura se l'utente è davvero migliorato. Funziona così:

1. Alla fine della diagnosi salviamo il θ "**before**" dei concetti risultati deboli.
2. L'utente vede le micro-lezioni su quei concetti.
3. Il re-test somministra **solo item di fase finale** (mai visti nella diagnosi) sugli stessi concetti deboli, e ricalcola θ.
4. Il confronto tra θ before e θ "**after**" è l'evidenza del miglioramento — il deliverable before/after richiesto dal tema, dimostrabile dal vivo.

Il punto metodologico che dà credibilità: usando item **diversi** da quelli della diagnosi, un miglioramento nel θ non può essere spiegato dal fatto che l'utente ricorda la risposta. Se risponde meglio, è perché ha capito il meccanismo. Nota onesta: con 2 item di verifica il salto di θ è misurabile ma contenuto — mostriamo un progresso reale, non un "da incapace a esperto in 30 secondi" che sarebbe poco credibile.

---

## 8. Le decisioni prese (con motivazione)

Tabella di riferimento per ricordare *perché* abbiamo scelto ogni cosa.

| Decisione | Scelta | Perché |
|---|---|---|
| Tema | Inclusione Finanziaria | Buon match col target adolescenti; problema reale |
| Target | 15-20 anni | Iniziano a gestire denaro ma la scuola non insegna nulla |
| Formato assessment | Simulazione + mini-gioco a gesture | I teenager scappano dai quiz scolastici |
| Modello di stima | IRT / Rasch semplificato | Serio ma leggero; converge in fretta; citabile |
| Update di θ | Passo di gradiente (stile Elo) | Semplice, robusto, spiegabile |
| Modelliamo σ | Sì | Ci distingue: confidenza, non solo punteggio |
| `K` (tasso apprendimento) | 0.7 | Tarato via simulazione (vedi sotto) |
| Soglie forte/debole | ±0.3 | Realistiche con pochi item per concetto |
| Difficoltà item | Assegnata a mano | Accettabile in 5h; dichiarata come scelta di design |
| Item divisi in fasi | 2 diagnosi + 2 re-test per concetto | Il re-test deve usare item nuovi, o misura la memoria e non la comprensione |

### La taratura dei parametri (da raccontare ai giudici)

Abbiamo **simulato tre profili di utente** (principiante, esperto, misto) per verificare il motore prima della demo. La prima versione (`K=0.4`, soglie ±0.5) schiacciava tutti verso "medio": con pochi item, θ non aveva abbastanza passi per superare le soglie. Alzando `K` a 0.7 e abbassando le soglie a ±0.3, il motore ha iniziato a classificare correttamente — in particolare becca il profilo *misto* (bravo col budget, debole sui costi nascosti), che è esattamente il caso d'uso della demo.

> Mostrare questo processo di tuning basato su dati, invece di parametri scelti a caso, è oro in un hackathon.

---

## 9. Cosa evitare (dai paletti del tema)

- ❌ Chatbot generici
- ❌ Pura riscrittura di testi senza logica applicativa
- ❌ Soluzioni che danno consigli finanziari
- ❌ Semplificazioni che cambiano il significato originale
- ❌ Demo non collegate a un processo reale

La nostra soluzione è al sicuro su tutti questi punti perché ha una vera logica applicativa (il motore), insegna concetti senza dare consigli, e la simulazione è ancorata a scenari di vita concreti.

---

## 10. Come difendere il progetto in 3 frasi

Se ci chiedono "come funziona":

> Modelliamo la comprensione di ogni concetto come un valore di abilità latente θ e lo stimiamo con il modello di Rasch (la stessa famiglia dei test adattivi tipo GRE). A ogni risposta aggiorniamo θ con un passo proporzionale alla *sorpresa* (come l'Elo negli scacchi), e scegliamo la domanda successiva puntando a quella più informativa — vicina al 50-50 — sul concetto di cui siamo meno sicuri. Quando abbiamo abbastanza certezza produciamo un profilo forte/debole per concetto, che pilota le micro-lezioni.

Le tre cose che ci distinguono:

1. Modelliamo anche l'**incertezza** (σ), non solo il punteggio.
2. L'assessment è **adattivo**, non una lista fissa di domande.
3. Abbiamo **tarato i parametri con una simulazione** invece di sceglierli a caso.

---

## 11. Traccia della demo

> Punti da toccare nella demo dal vivo. Da approfondire durante lo sviluppo — qui solo la scaletta per non dimenticare nulla.

- **Il problema in una frase** — perché un adolescente ha bisogno di questo (aggancio emotivo/reale, es. l'abbonamento dimenticato).
- **L'hook** — mostrare che si entra in una simulazione, non in un quiz. Far vedere le prime scelte a gesture.
- **L'assessment invisibile** — spiegare che dietro le scelte c'è un motore che misura il livello, senza che l'utente se ne accorga. È il cuore da far capire ai giudici.
- **L'adattività in azione** — mostrare che le situazioni cambiano in base alle risposte (concetto più incerto, difficoltà vicina al livello).
- **Il profilo di competenza** — la schermata forte/debole per concetto.
- **Le micro-lezioni mirate** — far vedere che arrivano SOLO sui concetti deboli, e con intensità diversa a seconda di quanto si è deboli.
- **Il momento clou: before/after** — mostrare il re-test con item nuovi e il salto di θ. È la prova del miglioramento misurabile.
- **Il rispetto dei paletti** — dire esplicitamente: insegniamo meccanismi, non diamo consigli finanziari (regola d'oro sugli item).
- **Cosa ci distingue** — chiudere con i 3 punti forti (modelliamo σ, assessment adattivo, parametri tarati con simulazione).

**Scenario da usare (personaggio):** un utente che parte **forte sul budget ma debole sui costi nascosti** → gioca → il sistema lo becca → riceve la lezione giusta → al re-test dimostra il miglioramento. (Personaggio e numeri esatti da definire in sviluppo.)

**Nota tecnica per la demo:** valutare se pre-caricare una sessione "pilotata" per garantire che il personaggio risulti debole sui concetti giusti, così la demo è ripetibile e non dipende dal caso.

---

## 12. Prossimi passi

- [x] ~~Espandere la banca di item a **16 item** (4 per concetto, difficoltà scalate).~~ ✅ Fatto
- [x] ~~Progettare le **micro-lezioni** per ciascun concetto, con varianti di intensità.~~ ✅ Fatto
- [ ] Costruire lo **scheletro Angular** che consuma `/start` e `/next` e anima la simulazione.
- [x] ~~Implementare la **verifica finale** (re-test) per l'evidenza before/after.~~ ✅ Fatto
- [ ] Preparare la **demo del percorso completo** (traccia dei punti in sezione 11): utente debole su un concetto → micro-lezione → miglioramento al re-test.
- [x] ~~Scrivere i **3 deliverable del tema**: User Difficulty Statement, Before/After Simplicity Evidence, Risk & Clarity Note.~~ ✅ Fatto (in `deliverable-tema.md`)

---

## Appendice — Avvio del backend

Il progetto è in due file: `engine.js` (logica + Fastify) e `content.js` (item + lezioni). Servono i moduli ES, quindi `package.json` deve avere `"type": "module"`.

```bash
npm i fastify
node engine.js
# in ascolto su http://localhost:3000
```

Endpoint:
- `POST /start` → `{ sessionId, item, fase }`
- `POST /next` con body `{ sessionId, itemId, opzioneId }` → prossimo item durante la diagnosi, oppure a fine diagnosi `{ profilo, concettiDaRinforzare, lezioni }` con le micro-lezioni già selezionate per i concetti deboli
- `POST /retest/start` con body `{ sessionId }` → primo item della verifica finale (da chiamare dopo le lezioni)
- `POST /retest` con body `{ sessionId, itemId, opzioneId }` → prossimo item di verifica, oppure a fine re-test `{ confronto }` con il before/after per ogni concetto: `{ concetto, before, after, delta, migliorato }`

Il flusso completo lato client è quindi: `/start` → `/next` (ripetuto) → mostra profilo e lezioni → `/retest/start` → `/retest` (ripetuto) → mostra il confronto before/after.
