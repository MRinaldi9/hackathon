---
name: hackathon-readme
description: Genera il README e la documentazione dell'applicazione per il progetto hackathon. Usala nella fase finale, quando il codice è stabile. Produce un README completo in italiano con il flusso agentico spiegato, l'architettura, il setup, i prerequisiti, le variabili d'ambiente e le istruzioni per far girare il sistema. Invocala con "/hackathon-readme" o quando l'utente vuole documentare il progetto, scrivere il README, o spiegare l'architettura.
when_to_use: Nella fase finale, quando il sistema è stabile, per produrre la documentazione del progetto valutabile dalla giuria.
context: fork
background: false
---

# Documentazione del progetto

Genera il README e la documentazione dell'applicazione. Una buona documentazione permette a chi valuta di capire in fretta cosa fa il sistema, com'è costruito, e come farlo girare. Un README chiaro con il flusso agentico spiegato è ciò che rende il progetto comprensibile e apprezzabile.

**Lingua:** tutta la documentazione in **italiano**. Nomi tecnici, comandi e keyword restano in inglese; il testo esplicativo è in italiano.

## Prima di iniziare

Esplora il progetto per documentarlo con precisione. Leggi l'orchestratore, i sub-agenti in `.claude/agents/` e `src/agents/`, la configurazione, e lo schema dello stato. Capisci il flusso reale del sistema prima di descriverlo, così la documentazione riflette ciò che il codice fa davvero e non un'idea generica.

## Struttura del README

Produci un `README.md` nella radice del progetto con questa struttura. Adattala al progetto reale, ma copri tutte le sezioni:

```markdown
# [Nome del progetto]

Breve descrizione in una o due frasi: quale problema reale affronta e perché un approccio agentico aggiunge valore concreto.

## Il problema

Descrivi il problema che l'app risolve. Spiega perché è un problema reale e rilevante, e perché un sistema di agenti è la risposta adeguata (non forzata).

## L'approccio agentico

Spiega come il sistema è organizzato in agenti. Descrivi l'orchestratore e ciascun sub-agente: qual è il ruolo di ognuno, cosa produce, e come collaborano. Questa è la sezione che mostra la profondità del sistema.

## Architettura e flusso

Descrivi il flusso end-to-end passo per passo: cosa succede da quando arriva un input a quando si produce il risultato. Includi un diagramma del flusso in formato testo/ASCII che mostri l'orchestratore, i sub-agenti, e come lo stato passa tra i passi. Spiega dove vive lo stato esternalizzato e perché.

## Scelte tecniche

Spiega le decisioni architetturali chiave e il loro perché:
- Perché il sistema usa più sub-agenti invece di un unico prompt.
- Come funziona il model tiering e perché certi compiti usano modelli più leggeri.
- Come il sistema gestisce gli errori: fallback, retry, limiti di iterazione.
- Dove e perché c'è un checkpoint di escalation umana (HITL).
- Come lo stato esternalizzato rende il workflow ispezionabile e ripartibile.

## Prerequisiti

Elenca cosa serve per far girare il progetto (versione di Python o Node, dipendenze principali, una chiave API di Anthropic).

## Setup

Istruzioni passo passo per l'installazione:
1. Clonare il repository.
2. Installare le dipendenze (comando esatto).
3. Copiare `.env.example` in `.env` e inserire le proprie chiavi.
4. Comando per avviare il sistema.

## Variabili d'ambiente

Elenca ogni variabile necessaria (per esempio ANTHROPIC_API_KEY) e a cosa serve. Non inserire mai valori reali.

## Come usarlo

Mostra un esempio concreto di utilizzo: un input di esempio e il risultato atteso, così chi valuta può provarlo subito.

## Struttura del repository

Una breve mappa delle cartelle principali e di cosa contengono, inclusa la cartella .claude/agents/ con i sub-agenti.
```

## Principi per una buona documentazione

- **Il diagramma del flusso agentico è essenziale.** Un diagramma ASCII che mostra orchestratore, sub-agenti e passaggio di stato comunica l'architettura in un colpo d'occhio. Dedicagli cura.
- **Spiega il perché, non solo il cosa.** Le scelte architetturali raccontate con la loro motivazione mostrano maturità e permettono a chi valuta di apprezzare il ragionamento dietro il sistema.
- **Rendi il setup a prova di errore.** Comandi esatti, copiabili, nell'ordine giusto. Chi valuta deve poter far girare il sistema senza intoppi.
- **Rifletti il codice reale.** Non descrivere funzionalità che non esistono. La documentazione deve corrispondere a ciò che il sistema fa davvero.

Se il progetto ha bisogno di più di un file di documentazione (per esempio un documento separato sull'architettura più dettagliato), crealo e collegalo dal README. Ma il README resta il punto d'ingresso completo.

## Al termine

Riepiloga all'utente in italiano cosa hai documentato. Poi suggerisci il commit:

- `git add -A`
- `git commit -m "docs: aggiunto README con architettura e flusso agentico"`
- `git push`

Indica il passo successivo: preparare la presentazione con `/hackathon-slides`.
