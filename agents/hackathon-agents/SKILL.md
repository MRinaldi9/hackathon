---
name: hackathon-agents
description: Scrive e raffina i system prompt (le istruzioni) degli agenti del progetto hackathon. Usala nella prima fase, dopo lo scaffold, per dare a ogni agente uno scope delimitato, un formato di output esplicito, vincoli chiari e nessuna sovrapposizione con gli altri. Invocala con "/hackathon-agents" o quando l'utente vuole scrivere, migliorare o rivedere le istruzioni degli agenti, i prompt di sistema, o gli scope di orchestrazione.
when_to_use: Dopo lo scaffold, per scrivere istruzioni di alta qualità per ogni agente del sistema, con scope, output e vincoli ben definiti.
context: fork
background: false
---

# Istruzioni degli agenti

Scrivi i system prompt degli agenti del progetto. La qualità delle istruzioni è ciò che trasforma un insieme di chiamate al modello in un sistema coordinato e affidabile. Prompt ben scritti hanno uno scope chiaro, un formato di output esplicito, vincoli precisi, e non si sovrappongono tra loro.

**Lingua:** scrivi i system prompt e ogni testo in **italiano**. Nomi tecnici e keyword in inglese secondo prassi, commenti e istruzioni in italiano.

## Prima di iniziare

Individua gli agenti già definiti nel progetto. Guarda in `.claude/agents/` e in `src/agents/` per capire quali agenti esistono e cosa dovrebbero fare. Se lo scaffold li ha già creati in forma base, il tuo compito è approfondirli e renderli eccellenti. Se mancano, chiedi all'utente la lista degli agenti e il loro ruolo.

## Cosa rende eccellente un system prompt di un agente

Applica questi principi a ogni agente. Sono il cuore della qualità delle istruzioni:

**Scope delimitato.** Ogni agente fa una cosa e la fa bene. Il prompt deve dire chiaramente qual è il compito dell'agente e, altrettanto importante, cosa NON è di sua competenza. Un agente con scope vago produce risultati vaghi e si sovrappone agli altri.

**Formato di output esplicito.** Specifica esattamente cosa l'agente deve restituire, preferibilmente uno schema strutturato (JSON con campi definiti). Un output strutturato permette all'orchestratore di ragionarci sopra in modo affidabile. Includi un esempio concreto dell'output atteso.

**Passi operativi chiari.** Dai all'agente una sequenza di passi da seguire quando viene invocato. La forma imperativa funziona meglio ("Quando vieni invocato: 1. leggi... 2. analizza... 3. restituisci...").

**Vincoli espliciti.** Elenca cosa l'agente non deve fare, i limiti del suo scope, e i casi limite che deve gestire. Spiega brevemente il perché di un vincolo quando aiuta la comprensione, invece di imporlo e basta.

**Nessuna sovrapposizione.** Verifica che gli agenti non facciano lo stesso lavoro. Se due agenti hanno responsabilità che si accavallano, ridefiniscine i confini. Le `description` nel frontmatter devono essere abbastanza specifiche da indirizzare l'orchestratore verso l'agente giusto.

**Coerenza tra i file.** Gli agenti che si passano dati devono concordare sul formato: l'output di uno deve combaciare con l'input atteso del successivo. Controlla che gli schemi siano coerenti lungo la pipeline.

## Struttura di un system prompt

Per ogni agente, scrivi (o raffina) sia il file in `.claude/agents/<nome>.md` sia, se serve, il prompt corrispondente usato nel codice in `src/agents/`. Mantienili allineati. La struttura di riferimento:

```markdown
---
name: nome-agente
description: Quando delegare a questo agente. Specifica e distintiva, così l'orchestratore sceglie quello giusto. Aggiungi "usa in modo proattivo" se appropriato.
tools: <solo i tool che questo agente usa davvero>
model: <haiku per compiti semplici, sonnet per ragionamento complesso>
---

Sei un agente specializzato in [compito specifico e delimitato].

## Il tuo compito
[descrizione precisa dello scope]

## Quando vieni invocato
1. [passo]
2. [passo]
3. [passo]

## Formato di output
Restituisci sempre un oggetto con questa struttura:
{
  "campo1": "...",
  "campo2": [...]
}

Esempio:
[esempio concreto e realistico dell'output]

## Vincoli
- Non [cosa evitare], perché [motivo].
- Se [caso limite], allora [comportamento].
- Il tuo scope si ferma a [confine]; non occuparti di [ciò che spetta ad altri agenti].
```

## Model tiering nelle istruzioni

Mentre definisci gli agenti, assegna consapevolmente il modello nel campo `model` del frontmatter e nella configurazione del codice. Un agente che fa classificazione, estrazione o parsing semplice può usare un modello leggero (`haiku`); un agente che sintetizza, ragiona o prende decisioni complesse merita un modello più capace (`sonnet`). Questa scelta riduce il consumo di token senza sacrificare la qualità dove serve. Annota il criterio con un commento in italiano.

## Al termine

Riepiloga all'utente in italiano cosa hai scritto per ciascun agente, evidenziando lo scope, il formato di output e il modello assegnato. Segnala eventuali sovrapposizioni che hai risolto. Poi suggerisci il commit:

- `git add -A`
- `git commit -m "feat: definiti i system prompt degli agenti e gli scope di orchestrazione"`
- `git push`

Indica il passo successivo: implementare l'orchestratore e far girare il primo sub-agente end-to-end (sviluppo libero con Claude Code), e quando il core funziona, fare il commit più importante e poi irrobustire con `/hackathon-robustness`.
