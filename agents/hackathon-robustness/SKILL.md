---
name: hackathon-robustness
description: Irrobustisce il sistema agentico del progetto hackathon aggiungendo fallback, gestione degli errori, retry con backoff, checkpoint di escalation umana (HITL), limiti di iterazione e model tiering. Usala nella terza fase, quando il core funziona end-to-end. Invocala con "/hackathon-robustness" o quando l'utente vuole rendere il sistema resiliente, gestire gli errori, evitare che si rompa in demo, o ottimizzare l'uso dei modelli.
when_to_use: Nella terza fase, dopo che l'orchestratore e i sub-agenti funzionano, per rendere il sistema resiliente e affidabile prima della demo.
context: fork
background: false
---

# Robustezza del sistema

Rendi il sistema agentico resiliente. Un prototipo che si rompe alla prima chiamata fallita non regge una demo; un sistema che gestisce gli errori con eleganza dimostra maturità ingegneristica. Il tuo compito è analizzare il codice esistente e aggiungere — o indicare con precisione dove aggiungere — i meccanismi che rendono il sistema affidabile.

**Lingua:** commenti nel codice e testo in **italiano**; nomi tecnici e keyword in inglese.

## Prima di iniziare

Analizza il codice esistente dell'orchestratore e dei sub-agenti (`src/orchestrator.py`, `src/agents/`, `src/config.py`). Individua i punti dove il sistema chiama servizi esterni (l'API di Claude, tool, servizi di rete): sono i punti che possono fallire e che vanno protetti.

## Meccanismi da aggiungere

### Gestione degli errori e fallback

Ogni chiamata a un servizio esterno deve essere avvolta in una gestione degli errori. Quando una chiamata fallisce, il sistema deve avere un piano B: un valore di default sensato, un percorso alternativo, o una degradazione controllata invece di un crash. Aggiungi try/except (o equivalente) attorno alle chiamate esterne, con commenti in italiano che spiegano la strategia di fallback.

### Retry con backoff esponenziale

Gli errori transitori (rate limit, timeout di rete, sovraccarico temporaneo) spesso si risolvono da soli al secondo tentativo. Implementa un retry con backoff esponenziale: ritenta la chiamata un numero limitato di volte, aspettando progressivamente di più tra un tentativo e l'altro. Definisci un numero massimo di tentativi per evitare loop infiniti. Distingui gli errori transitori (da ritentare) da quelli permanenti (da gestire diversamente).

### Checkpoint di escalation umana (HITL)

Un buon sistema agentico sa quando fermarsi e chiedere a un umano invece di procedere alla cieca. Aggiungi almeno un checkpoint dove il sistema mette in pausa il workflow e attende una conferma o una decisione dell'utente prima di proseguire — per esempio prima di un'azione irreversibile, o quando la confidenza su un risultato è bassa. Questo è l'"human in the loop": rendilo intenzionale e visibile nel flusso.

### Limiti di iterazione

Ogni loop del workflow deve avere un limite massimo di iterazioni. Un orchestratore che continua a delegare senza un tetto può entrare in un ciclo infinito e bruciare token. Imposta limiti espliciti e gestisci il caso in cui il limite viene raggiunto (per esempio restituendo il miglior risultato parziale con una nota).

### Model tiering

Verifica che i modelli siano assegnati in modo efficiente: modelli leggeri per compiti semplici, modelli capaci solo dove serve ragionamento. Se lo scaffold o la definizione degli agenti non l'hanno già fatto, sistemalo ora nella configurazione. Questo riduce il consumo di token e i costi senza sacrificare la qualità. Documenta il criterio con commenti in italiano.

## Qualità tecnica generale

Mentre lavori, cogli l'occasione per rafforzare la qualità tecnica complessiva:

- **Timeout** su tutte le chiamate di rete, così una chiamata bloccata non congela l'intero sistema.
- **Segreti nelle variabili d'ambiente**, mai hardcoded. Se trovi chiavi o token scritti nel codice, spostali in `.env` e caricali da lì.
- **Configurazione centralizzata** in `config.py`, così i parametri (numero di retry, timeout, limiti di iterazione) sono in un posto solo e facili da regolare.
- **Logging** essenziale nei punti chiave del workflow, così in demo si vede cosa sta facendo il sistema e si può diagnosticare un problema.

## Al termine

Riepiloga all'utente in italiano i meccanismi che hai aggiunto e dove, spiegando come ciascuno rende il sistema più affidabile. Poi suggerisci il commit:

- `git add -A`
- `git commit -m "feat: aggiunti fallback, retry, checkpoint HITL e model tiering"`
- `git push`

Indica il passo successivo: completare l'interfaccia web e la rifinitura (sviluppo libero), poi documentare con `/hackathon-readme`.
