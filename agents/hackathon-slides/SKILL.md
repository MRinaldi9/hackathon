---
name: hackathon-slides
description: Genera la presentazione del progetto hackathon come sito web HTML brandizzato Accenture, prodotto interamente da questa skill. Non slide statiche PowerPoint, ma un sito che ricorda delle slide ma è più dinamico e innovativo. Usala nella fase finale, quando l'app funziona. Invocala con "/hackathon-slides" o quando l'utente vuole preparare la presentazione, le slide, o il deck da mostrare alla giuria.
when_to_use: Nella fase finale, quando il sistema è funzionante, per produrre la presentazione HTML brandizzata Accenture da mostrare alla giuria.
context: fork
background: false
---

# Presentazione HTML brandizzata Accenture

Genera la presentazione del progetto come **sito web HTML autonomo**, brandizzato Accenture. Non deve essere un insieme di slide statiche in stile PowerPoint: deve ricordare delle slide (sezioni a schermo intero, navigazione tra "slide") ma essere più innovativo e dinamico, sfruttando il web — transizioni fluide, navigazione con tastiera e scroll, ed elementi visivi curati come un diagramma dell'architettura. Un singolo file HTML che si apre nel browser senza dipendenze esterne.

**Lingua:** tutto il contenuto della presentazione in **italiano**.

## Prima di iniziare

Esplora il progetto per presentarlo con contenuti reali: leggi il README, l'orchestratore, i sub-agenti, e capisci il flusso. Poi chiedi all'utente i punti chiave che vuole evidenziare se non emergono già chiaramente:

1. Il problema che il progetto risolve.
2. La soluzione e l'approccio agentico.
3. L'architettura (orchestratore e sub-agenti).
4. La demo o il risultato concreto.

## Identità visiva Accenture

Usa questi design token, basati sull'identità pubblica del brand Accenture. Se l'utente riceve asset ufficiali all'evento (logo, font come Graphik), sostituisci i segnaposto; altrimenti questi valori danno un risultato coerente e riconoscibile.

```css
:root {
  /* Colore primario: il viola caratteristico Accenture */
  --accenture-purple: #A100FF;
  --accenture-purple-scuro: #7500C0;
  --accenture-purple-chiaro: #B24BFF;
  /* Base */
  --nero: #000000;
  --bianco: #FFFFFF;
  --grigio-scuro: #1A1A1A;
  --grigio: #96968C;
  --grigio-chiaro: #F2F2F2;
}
```

Elementi distintivi dell'identità Accenture da usare con misura:

- **Il simbolo "greater than" (`>`)** è l'accento grafico distintivo del brand. Usalo come elemento decorativo: davanti ai titoli di sezione, come indicatore di avanzamento, o come motivo grafico. Non abusarne, ma è la firma visiva riconoscibile.
- **Fondo scuro o bianco pulito** con il viola come unico accento forte. L'estetica Accenture è essenziale e ad alto contrasto, non carica.
- **Tipografia pulita e generosa.** Testo grande e leggibile, molto spazio bianco, gerarchia chiara. Usa un font sans-serif di sistema pulito se non hai Graphik.

## Struttura della presentazione

Costruisci un sito HTML con sezioni a schermo intero navigabili come slide. Un arco narrativo efficace:

1. **Copertina** — nome del progetto, un sottotitolo che cattura l'essenza, il branding Accenture. Pulita e d'impatto.
2. **Il problema** — quale problema reale, perché è rilevante.
3. **La soluzione** — l'approccio agentico in sintesi, perché aggiunge valore concreto.
4. **L'architettura** — il pezzo forte: un diagramma visivo dell'orchestratore e dei sub-agenti, con il flusso e lo stato. Rendilo chiaro e curato, è ciò che mostra la profondità del sistema.
5. **Le scelte tecniche** — robustezza, model tiering, stato esternalizzato, HITL: i punti che dimostrano maturità ingegneristica.
6. **Demo / risultato** — cosa fa il sistema in pratica, un esempio concreto.
7. **Chiusura** — sintesi e branding finale.

## Requisiti tecnici del sito

- **Un unico file HTML autonomo**, con CSS e JavaScript inline. Nessuna dipendenza esterna (niente CDN), così funziona ovunque anche offline.
- **Navigazione fluida tra le sezioni**: frecce della tastiera (sinistra/destra o su/giù), e scroll. Aggiungi indicatori di posizione (per esempio puntini o un contatore di slide).
- **Transizioni curate** tra una sezione e l'altra, ma sobrie e veloci — l'eleganza sta nella pulizia, non negli effetti.
- **Responsive**, così si vede bene sia su schermo del presentatore sia proiettato.
- **Il diagramma dell'architettura** può essere costruito con HTML/CSS o SVG inline: box per l'orchestratore e i sub-agenti, frecce per il flusso, in stile coerente con il brand.
- **Nessun localStorage o storage del browser** (non necessario e può creare problemi): tieni tutto lo stato in memoria con JavaScript.

Salva il file nel progetto in una posizione sensata, per esempio `presentazione/index.html` o `web/presentazione.html`, così viene versionato e pushato con il resto.

## Principi

- **Meno è meglio.** L'estetica Accenture è essenziale. Contrasto forte, un solo accento viola, molto spazio. Evita il sovraccarico visivo.
- **Il contenuto guida.** Ogni slide comunica un'idea chiara. Testo conciso, non paragrafi densi.
- **L'architettura è il momento clou.** Investi la cura maggiore nel diagramma del sistema: è ciò che racconta la profondità agentica del progetto.

## Al termine

Riepiloga all'utente in italiano cosa hai creato e dove si trova il file, e digli di aprirlo nel browser per verificarlo. Poi suggerisci il commit:

- `git add -A`
- `git commit -m "feat: aggiunta presentazione HTML brandizzata Accenture"`
- `git push`

Indica il passo successivo: i controlli finali con `/hackathon-checklist` prima della consegna.
