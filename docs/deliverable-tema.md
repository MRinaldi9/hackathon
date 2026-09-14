# Deliverable del tema — Inclusione Finanziaria

> I tre deliverable richiesti esplicitamente dal Tema 02. Pronti da consegnare o inserire nelle slide.

---

## Deliverable 01 — User Difficulty Statement

*Quale difficoltà ha l'utente, in quale processo, e perché è rilevante.*

**Chi è l'utente.** Un adolescente di 15-20 anni che ha appena iniziato a gestire denaro proprio: paghetta, primo lavoretto, prima carta o app di pagamento, primi abbonamenti digitali.

**La difficoltà.** Non riconosce i **meccanismi finanziari nascosti** dietro alle scelte quotidiane che già compie. In concreto: attiva un abbonamento "3 mesi gratis" senza capire che al quarto mese scatta un addebito ricorrente; guarda il prezzo di un prodotto ignorando le commissioni e le spese che lo gonfiano; non ha un'idea di come risparmi o debiti crescano nel tempo; fatica a far quadrare quanto entra con quanto esce.

**In quale processo si manifesta.** Nei micro-processi digitali di tutti i giorni: sottoscrivere un servizio, completare un acquisto online, decidere se un'offerta conviene, pianificare un obiettivo di risparmio. Sono processi che l'adolescente **affronta già da solo**, senza gli strumenti concettuali per farlo in modo consapevole.

**Perché è rilevante.** È l'età esatta in cui si formano le abitudini finanziarie, ma la scuola non insegna quasi nulla di pratico su questi temi. Una lacuna qui non è teorica: si traduce in denaro perso in abbonamenti dimenticati, acquisti valutati male e assenza di risparmio. Intervenire ora, quando le cifre in gioco sono ancora piccole, previene errori più costosi da adulti.

---

## Deliverable 02 — Before / After Simplicity Evidence

*Un esempio concreto di come un processo reale viene reso più chiaro.*

Prendiamo il processo più rappresentativo: **capire un abbonamento con periodo di prova gratuito** (concetto `costi_ricorrenti`).

### PRIMA (senza la nostra soluzione)

L'adolescente vede questo messaggio, tipico di moltissime app reali:

> *"Prova Premium GRATIS per 3 mesi! Poi solo 9,99 €/mese. Annulla quando vuoi."*

Cosa succede nella sua testa: legge "gratis" e "annulla quando vuoi", percepisce l'offerta come **priva di rischio**, e attiva. Il meccanismo dell'addebito automatico al quarto mese resta invisibile. Tre mesi dopo si trova 9,99 € prelevati ogni mese per un servizio che magari non usa più — spesso senza nemmeno accorgersene per parecchio tempo.

### DOPO (con la nostra soluzione)

Lo stesso messaggio diventa una **situazione giocabile** dentro la simulazione. All'adolescente viene chiesto, con una scelta rapida:

> *"Un'app ti offre 3 mesi gratis, poi 9,99 €/mese in automatico. Cosa succede al 4° mese se non fai nulla?"*
> — Resta gratis / **Ti addebita 9,99 € ogni mese** / Si cancella da solo

Il sistema misura silenziosamente se ha capito il meccanismo. Se sbaglia (o esita), gli viene mostrata una **micro-lezione mirata**, con intensità proporzionale alla lacuna:

> **I soldi che escono ogni mese senza che te ne accorgi**
> Un abbonamento non è un pagamento: è un rubinetto aperto. Continua a prelevare finché non lo chiudi tu.
> *Esempio:* 4,99 €/mese sembrano pochi, ma sono 60 € in un anno, 120 € in due.
> *Takeaway:* prima di attivare "3 mesi gratis", segnati quando scatta il pagamento e decidi in anticipo se lo terrai.

### L'evidenza del miglioramento

Il salto è **misurabile**, non solo qualitativo. Il motore stima la comprensione del concetto (θ) prima e dopo:

| | Comprensione di `costi_ricorrenti` |
|---|---|
| Inizio (fase diagnostica) | θ basso → concetto marcato **debole** |
| Dopo la micro-lezione (re-test) | θ risalito → concetto **acquisito** |

Da "attivo l'offerta senza capire il rischio" a "so riconoscere un addebito ricorrente e valutarlo sul totale annuo". Lo stesso schema before/after vale per gli altri concetti: costi nascosti, interesse composto, budget.

---

## Deliverable 03 — Risk & Clarity Note

*Cosa è stato semplificato, cosa NON è stato alterato, e come è stata evitata l'ambiguità.*

**Cosa abbiamo semplificato.** Il linguaggio e il formato. Abbiamo tradotto meccanismi finanziari in situazioni di vita quotidiana con numeri piccoli e concreti (100 €, 9,99 €/mese, 30 €/mese), eliminato il gergo tecnico dove non necessario, e spezzato ogni concetto in un'unica idea alla volta. Abbiamo anche semplificato la *forma* dell'apprendimento: niente lezione frontale, ma scelte rapide dentro una simulazione.

**Cosa NON abbiamo alterato.** Il **significato** dei concetti finanziari. Un addebito ricorrente resta un addebito ricorrente; l'interesse composto cresce davvero "sugli interessi"; una commissione si somma sempre al prezzo. Le semplificazioni riguardano *come* spieghiamo, mai *cosa* è vero. Nessuna cifra o meccanismo è stato distorto per rendere la lezione più facile.

**Il paletto più importante: niente consulenza finanziaria.** Il tema vieta esplicitamente raccomandazioni di investimento e consigli personalizzati. Abbiamo rispettato questo vincolo con una **regola di design applicata a ogni singolo item**: la risposta corretta dimostra sempre la *comprensione di un meccanismo*, mai un consiglio su cosa fare.

- ✅ Corretto: *"l'abbonamento ti addebita 9,99 € ogni mese"* → spiega come funziona
- ❌ Evitato: *"non fare mai abbonamenti"* → sarebbe un consiglio finanziario

Insegniamo a **capire**, non diciamo cosa comprare, vendere o scegliere. L'utente resta libero di decidere; noi gli diamo solo gli strumenti per farlo consapevolmente.

**Come abbiamo evitato l'ambiguità.** Ogni item ha una sola risposta inequivocabilmente corretta (verificato: 16 item su 16), con distrattori che rappresentano fraintendimenti realistici e non "trabocchetti". Gli esempi numerici sono scelti perché il calcolo sia netto (10% di 100 € = 10 €, non cifre che si prestano ad arrotondamenti confusi). Le micro-lezioni chiudono sempre con un *takeaway* azionabile e non ambiguo. Dove un concetto ha sfumature che non possiamo trattare in modo responsabile a questo livello (es. fiscalità, prodotti d'investimento), semplicemente **non entriamo** — restiamo sulla finanza personale di base, come richiesto dal tema.
