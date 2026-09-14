---
name: hackathon-checklist
description: Esegue i controlli finali sul progetto hackathon prima della consegna. Usala negli ultimi minuti, come ultimo passaggio. Scansiona il repository per individuare problemi facili da dimenticare sotto pressione, come chiavi API hardcoded, .env committato per sbaglio, gestione errori mancante, README incompleto, commit non fatti. Invocala con "/hackathon-checklist" o quando l'utente vuole fare un controllo finale, verificare che sia tutto a posto, o prepararsi alla consegna.
when_to_use: Negli ultimi minuti prima della consegna, per un controllo finale che eviti brutte figure ed errori dimenticati.
context: fork
background: false
---

# Controlli finali pre-consegna

Esegui un controllo sistematico del progetto prima della consegna. Sotto pressione è facile dimenticare dettagli che fanno la differenza tra una consegna pulita e una con problemi evidenti. Il tuo compito è scansionare il repository, segnalare i problemi in ordine di gravità, e aiutare l'utente a sistemarli in fretta.

**Lingua:** riporta tutto in **italiano**.

## Controlli da eseguire

Vai in ordine, dal più critico al meno. Per ciascuno, ispeziona il progetto e riporta l'esito chiaramente.

### Sicurezza (critico)

- **Chiavi API o segreti hardcoded.** Cerca nel codice stringhe che sembrano chiavi, token o password scritte direttamente (per esempio pattern come `sk-`, `api_key = "..."`, token lunghi). Devono stare nelle variabili d'ambiente, mai nel codice. Se ne trovi, questa è la priorità assoluta.
- **File `.env` committato.** Verifica che `.env` NON sia tracciato da git e che sia presente in `.gitignore`. Controlla anche che non sia già finito nella storia dei commit. Se `.env` è tracciato, va rimosso dal tracking subito.
- **Altri file sensibili** eventualmente committati per sbaglio (credenziali, file di configurazione locale con dati reali).

### Robustezza (importante)

- **Gestione degli errori sulle chiamate esterne.** Verifica che le chiamate all'API e ai servizi di rete siano protette da gestione degli errori e non lascino il sistema esposto a un crash alla prima chiamata fallita.
- **Limiti di iterazione** presenti sui loop del workflow, così il sistema non può entrare in un ciclo infinito durante la demo.
- **Il sistema parte davvero.** Se possibile, verifica che le istruzioni di setup del README portino effettivamente a un sistema funzionante: dipendenze dichiarate correttamente, comando di avvio valido.

### Documentazione (importante)

- **README completo.** Verifica che ci siano tutte le sezioni chiave: descrizione, approccio agentico, architettura con diagramma, setup, prerequisiti, variabili d'ambiente. Segnala sezioni mancanti o segnaposto rimasti da riempire.
- **`.env.example` presente e aggiornato**, con tutte le variabili necessarie e senza valori reali.
- **Coerenza** tra ciò che il README dice e ciò che il codice fa.

### Qualità e pulizia (utile)

- **File inutili o temporanei** da rimuovere (cache, file di prova, output temporanei).
- **Commenti nel codice in italiano** nei punti chiave, dove aiutano a capire il flusso.
- **Struttura del repository ordinata**, con i sub-agenti in `.claude/agents/` e le cartelle sensate.

### Git (finale)

- **Tutte le modifiche committate.** Verifica con lo stato di git che non ci siano modifiche non salvate.
- **Storia dei commit pulita.** Controlla che ci sia una sequenza di commit sensata lungo le fasi, non un unico commit finale.
- **Push completato.** Assicurati che l'ultimo commit sia stato pushato sul repository remoto, così la giuria vede la versione aggiornata.

## Come riportare

Presenta l'esito all'utente in italiano come un elenco per gravità: prima i problemi critici (se ce ne sono), poi gli importanti, poi i suggerimenti. Per ogni problema trovato, indica dove si trova e come sistemarlo in fretta. Se un controllo è a posto, confermalo brevemente così l'utente ha la certezza che sia stato verificato.

Se trovi problemi critici (segreti hardcoded, `.env` committato), aiuta l'utente a risolverli subito prima di qualunque altra cosa.

## Al termine

Quando tutto è a posto, suggerisci il commit finale e il push:

- `git add -A`
- `git commit -m "chore: pulizia finale e controlli pre-consegna"`
- `git push`

Poi conferma all'utente che il progetto è pronto per la consegna e la valutazione. In bocca al lupo.
