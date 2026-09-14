// ============================================================
//  CONTENUTO  —  Hagenthon / Inclusione Finanziaria
//  Banca di item (16, 4 per concetto) + micro-lezioni adattive.
//  Formato compatibile con engine.js (stesso schema ITEMS).
//
//  REGOLA D'ORO PER GLI ITEM:
//  L'opzione con correct:true dimostra COMPRENSIONE di un
//  meccanismo, MAI un consiglio ("risparmia sempre", "non
//  fare abbonamenti"). Questo ci tiene puliti rispetto al
//  divieto di consulenza finanziaria del tema.
//
//  SCALA DIFFICOLTA':  -2 facilissimo  ..  +2 difficilissimo
//  Assegnata a mano (scelta di design dichiarata).
//
//  FASI:
//  - 'iniziale': usato nella diagnosi adattiva (test iniziale)
//  - 'finale':   usato nel re-test (mai visto nella diagnosi)
//  Questa separazione garantisce che il re-test misuri
//  comprensione, non memoria delle risposte.
// ============================================================

// ---- BANCA DI ITEM -------------------------------------------
export const ITEMS = [

  // === COSTI RICORRENTI =======================================
  {
    id: 'sub_1', concetto: 'costi_ricorrenti', difficolta: -1.5, fase: 'iniziale',
    testo: `Un'app ti offre 3 mesi gratis, poi 9,99 €/mese in automatico. Cosa succede al 4° mese se non fai nulla?`,
    opzioni: [
      { id: 'a', testo: `Resta gratis`,                     correct: false },
      { id: 'b', testo: `Ti addebita 9,99 € ogni mese`,     correct: true  },
      { id: 'c', testo: `L'abbonamento si cancella da solo`, correct: false },
    ],
  },
  {
    id: 'sub_2', concetto: 'costi_ricorrenti', difficolta: -0.3, fase: 'finale',
    testo: `Hai 4 abbonamenti da 4,99 €/mese che usi poco. Quanto ti costano in un anno?`,
    opzioni: [
      { id: 'a', testo: `Circa 20 €`,  correct: false },
      { id: 'b', testo: `Circa 60 €`,  correct: false },
      { id: 'c', testo: `Circa 240 €`, correct: true  },
    ],
  },
  {
    id: 'sub_3', concetto: 'costi_ricorrenti', difficolta: 0.7, fase: 'iniziale',
    testo: `Un servizio costa 1 €/settimana. Un altro identico costa 4 €/mese. Quale ti fa spendere di meno in un anno?`,
    opzioni: [
      { id: 'a', testo: `Quello a 1 €/settimana`,     correct: false },
      { id: 'b', testo: `Quello a 4 €/mese`,          correct: true  },
      { id: 'c', testo: `Costano esattamente uguale`, correct: false },
    ],
  },
  {
    id: 'sub_4', concetto: 'costi_ricorrenti', difficolta: 1.5, fase: 'finale',
    testo: `Perché un abbonamento da 5 €/mese può pesare più di un acquisto una tantum da 50 €?`,
    opzioni: [
      { id: 'a', testo: `Perché continua a prelevare denaro finché non lo annulli, per anni`,  correct: true  },
      { id: 'b', testo: `Perché i pagamenti mensili costano sempre di più di quelli singoli`,   correct: false },
      { id: 'c', testo: `Non è vero, 50 € sono sempre di più di 5 €`,                            correct: false },
    ],
  },

  // === INTERESSE COMPOSTO =====================================
  {
    id: 'int_1', concetto: 'interesse_composto', difficolta: -1.0, fase: 'iniziale',
    testo: `Metti 100 € su un conto che rende il 10% all'anno. Dopo 1 anno quanto hai?`,
    opzioni: [
      { id: 'a', testo: `100 €`, correct: false },
      { id: 'b', testo: `110 €`, correct: true  },
      { id: 'c', testo: `200 €`, correct: false },
    ],
  },
  {
    id: 'int_2', concetto: 'interesse_composto', difficolta: 0.2, fase: 'finale',
    testo: `Quei 100 € crescono del 10% all'anno. Dopo 2 anni hai più o meno di 120 €?`,
    opzioni: [
      { id: 'a', testo: `Esattamente 120 €`,     correct: false },
      { id: 'b', testo: `Più di 120 € (121 €)`,  correct: true  },
      { id: 'c', testo: `Meno di 120 €`,         correct: false },
    ],
  },
  {
    id: 'int_3', concetto: 'interesse_composto', difficolta: 1.0, fase: 'iniziale',
    testo: `Perché il secondo anno guadagni più interessi del primo, anche se il tasso non cambia?`,
    opzioni: [
      { id: 'a', testo: `Perché il 10% si calcola su una cifra più grande (100 € + interessi)`, correct: true  },
      { id: 'b', testo: `Perché la banca aumenta il tasso ogni anno`,                            correct: false },
      { id: 'c', testo: `Perché aggiungi tu altri soldi ogni anno`,                              correct: false },
    ],
  },
  {
    id: 'int_4', concetto: 'interesse_composto', difficolta: 1.8, fase: 'finale',
    testo: `Un debito di 200 € con interesse composto lasciato non pagato per molti anni: come cresce?`,
    opzioni: [
      { id: 'a', testo: `Sempre più in fretta, perché gli interessi maturano sugli interessi`, correct: true  },
      { id: 'b', testo: `Di una cifra fissa uguale ogni anno`,                                  correct: false },
      { id: 'c', testo: `Smette di crescere dopo il primo anno`,                                correct: false },
    ],
  },

  // === BUDGET =================================================
  {
    id: 'bud_1', concetto: 'budget', difficolta: -1.8, fase: 'iniziale',
    testo: `Guadagni 50 € col lavoretto e ne spendi 65 €. Cosa significa?`,
    opzioni: [
      { id: 'a', testo: `Stai spendendo più di quanto guadagni`, correct: true  },
      { id: 'b', testo: `Sei in pareggio`,                       correct: false },
      { id: 'c', testo: `Stai risparmiando 15 €`,                correct: false },
    ],
  },
  {
    id: 'bud_2', concetto: 'budget', difficolta: -0.5, fase: 'finale',
    testo: `Ricevi 40 € di paghetta al mese. Vuoi mettere da parte 10 € e spendere il resto. Quanto puoi spendere?`,
    opzioni: [
      { id: 'a', testo: `40 €`, correct: false },
      { id: 'b', testo: `30 €`, correct: true  },
      { id: 'c', testo: `10 €`, correct: false },
    ],
  },
  {
    id: 'bud_3', concetto: 'budget', difficolta: 0.5, fase: 'iniziale',
    testo: `Vuoi comprare qualcosa da 180 € risparmiando 30 €/mese. Fra quanti mesi ce la fai?`,
    opzioni: [
      { id: 'a', testo: `3 mesi`, correct: false },
      { id: 'b', testo: `6 mesi`, correct: true  },
      { id: 'c', testo: `9 mesi`, correct: false },
    ],
  },
  {
    id: 'bud_4', concetto: 'budget', difficolta: 1.3, fase: 'finale',
    testo: `Un mese arriva una spesa a sorpresa da 50 €. Perché avere un piccolo "cuscinetto" di risparmi aiuta?`,
    opzioni: [
      { id: 'a', testo: `Perché puoi coprirla senza andare in negativo o rinunciare al necessario`, correct: true  },
      { id: 'b', testo: `Perché le spese a sorpresa non capitano se hai risparmi`,                   correct: false },
      { id: 'c', testo: `Non aiuta, tanto i soldi vanno spesi comunque`,                             correct: false },
    ],
  },

  // === COMMISSIONI ============================================
  {
    id: 'com_1', concetto: 'commissioni', difficolta: -1.2, fase: 'iniziale',
    testo: `Prelevi 10 € a un bancomat di un'altra banca che applica 2 € di commissione. Quanto ti costa in tutto?`,
    opzioni: [
      { id: 'a', testo: `10 €`, correct: false },
      { id: 'b', testo: `12 €`, correct: true  },
      { id: 'c', testo: `8 €`,  correct: false },
    ],
  },
  {
    id: 'com_2', concetto: 'commissioni', difficolta: -0.2, fase: 'finale',
    testo: `Compri qualcosa online a 20 € ma ci sono 3 € di spese di spedizione. Quanto paghi davvero?`,
    opzioni: [
      { id: 'a', testo: `20 €`, correct: false },
      { id: 'b', testo: `23 €`, correct: true  },
      { id: 'c', testo: `17 €`, correct: false },
    ],
  },
  {
    id: 'com_3', concetto: 'commissioni', difficolta: 0.8, fase: 'iniziale',
    testo: `Due offerte per lo stesso prodotto: A costa 100 € senza spese, B costa 95 € + 8 € di spese. Quale ti costa meno?`,
    opzioni: [
      { id: 'a', testo: `A (100 € totali)`,          correct: true  },
      { id: 'b', testo: `B (sembra più economica)`,  correct: false },
      { id: 'c', testo: `Costano uguale`,            correct: false },
    ],
  },
  {
    id: 'com_4', concetto: 'commissioni', difficolta: 1.6, fase: 'finale',
    testo: `Un'offerta lampo dice '-30%!' ma aggiunge 6 € di 'costi di servizio' su un prodotto da 20 €. Come valuti se conviene davvero?`,
    opzioni: [
      { id: 'a', testo: `Calcolo il totale finale e lo confronto col prezzo normale`, correct: true  },
      { id: 'b', testo: `Guardo solo la percentuale di sconto, è quella che conta`,    correct: false },
      { id: 'c', testo: `I costi di servizio si possono sempre ignorare`,             correct: false },
    ],
  },
];

// ---- MICRO-LEZIONI -------------------------------------------
// Una per concetto, con 3 varianti di INTENSITA' scelte in base
// a quanto l'utente e' debole (vedi funzione scegliLezione sotto):
//   - "fondamenta": theta molto basso -> si parte da zero
//   - "rinforzo":   theta vicino alla soglia -> ripasso rapido
//   - "cenno":      theta ok ma non forte -> solo un promemoria
//
// Ogni variante e' breve e visiva (adatta a un teenager): un titolo,
// un'idea in una frase, un esempio concreto con numeri, un takeaway.
export const LEZIONI = {

  costi_ricorrenti: {
    titolo: `I soldi che escono ogni mese senza che te ne accorgi`,
    fondamenta: {
      idea: `Un abbonamento non è un pagamento: è un rubinetto aperto. Continua a prelevare finché non lo chiudi tu.`,
      esempio: `4,99 €/mese sembrano pochi. Ma sono 60 € in un anno, 120 € in due. Per un servizio che magari usi una volta al mese.`,
      takeaway: `Prima di attivare "3 mesi gratis", segnati quando scatta il pagamento e decidi in anticipo se lo terrai.`,
    },
    rinforzo: {
      idea: `Il costo vero di un abbonamento non è il prezzo mensile, ma quel prezzo moltiplicato per tutti i mesi in cui resta attivo.`,
      esempio: `5 €/mese × 12 = 60 €/anno. Confronta sempre sul totale annuo, non sul singolo mese.`,
      takeaway: `Ogni tanto controlla la lista dei tuoi abbonamenti attivi.`,
    },
    cenno: {
      idea: `Ricorda: le spese ricorrenti si sommano nel tempo anche quando ogni singolo addebito è piccolo.`,
      esempio: ``,
      takeaway: `Ragiona sempre in "quanto mi costa in un anno".`,
    },
  },

  interesse_composto: {
    titolo: `Perché i soldi (e i debiti) crescono a valanga`,
    fondamenta: {
      idea: `L'interesse composto vuol dire che guadagni interessi anche sugli interessi già guadagnati. Il mucchio cresce sul mucchio.`,
      esempio: `100 € al 10%: dopo 1 anno 110 €. Il secondo anno il 10% si calcola su 110, non su 100 -> 121 €. E così, sempre più in fretta.`,
      takeaway: `Vale nei due sensi: fa crescere i risparmi, ma fa gonfiare anche i debiti non pagati.`,
    },
    rinforzo: {
      idea: `Ogni anno la percentuale si applica a una base più grande, quindi il guadagno (o il debito) accelera.`,
      esempio: `Anno 1: +10 €. Anno 2: +11 €. Anno 3: +12,1 €. La stessa percentuale, cifre sempre maggiori.`,
      takeaway: `Il tempo è l'ingrediente segreto: prima inizi, più l'effetto è forte.`,
    },
    cenno: {
      idea: `Ricorda: con l'interesse composto la crescita non è costante, accelera nel tempo.`,
      esempio: ``,
      takeaway: `Più anni passano, più l'effetto valanga si nota.`,
    },
  },

  budget: {
    titolo: `Far quadrare entrate e uscite`,
    fondamenta: {
      idea: `Un budget è solo questo: quanto entra, quanto esce, e cosa resta. Se esce più di quanto entra, sei in rosso.`,
      esempio: `Entrano 50 €, escono 65 €: mancano 15 €. Per stare in piedi, le uscite devono restare sotto le entrate.`,
      takeaway: `Decidi in anticipo quanto mettere da parte, poi spendi solo ciò che resta.`,
    },
    rinforzo: {
      idea: `Metti da parte PRIMA, spendi DOPO. Così il risparmio non è quello che "avanza" (che spesso è zero).`,
      esempio: `Paghetta 40 €: prima metti via 10 €, poi sai di poter spendere 30 €. Non il contrario.`,
      takeaway: `Un piccolo cuscinetto ti salva dalle spese a sorpresa.`,
    },
    cenno: {
      idea: `Ricorda: pianifica quanto risparmiare prima di iniziare a spendere.`,
      esempio: ``,
      takeaway: `Prima il risparmio, poi le spese.`,
    },
  },

  commissioni: {
    titolo: `Il prezzo sull'etichetta non è sempre quello che paghi`,
    fondamenta: {
      idea: `Commissioni, spese di spedizione, costi di servizio: sono soldi in più che si aggiungono al prezzo. Conta sempre il TOTALE finale.`,
      esempio: `Prelievo di 10 € + 2 € di commissione = ti costa 12 €. Il "10 €" era solo una parte.`,
      takeaway: `Prima di confermare, cerca il totale reale, non il prezzo di partenza.`,
    },
    rinforzo: {
      idea: `Per confrontare due offerte, somma sempre prezzo + spese di ciascuna, poi guarda quale totale è più basso.`,
      esempio: `A: 100 € senza spese. B: 95 € + 8 € = 103 €. A conviene, anche se sembrava più cara.`,
      takeaway: `Uno sconto in percentuale può nascondere costi fissi che lo annullano.`,
    },
    cenno: {
      idea: `Ricorda: aggiungi sempre le spese accessorie al prezzo prima di decidere.`,
      esempio: ``,
      takeaway: `Confronta sui totali, non sui prezzi di listino.`,
    },
  },
};

// ---- SELEZIONE DELLA VARIANTE DI LEZIONE ---------------------
// Dato il theta stimato per un concetto, sceglie l'intensita' giusta.
// Coerente con le soglie del motore (debole <= -0.3).
export function scegliLezione(concetto, theta) {
  const l = LEZIONI[concetto];
  if (!l) return null;
  let variante;
  if (theta <= -1.0)      variante = 'fondamenta'; // molto debole: si parte da zero
  else if (theta <= -0.3) variante = 'rinforzo';   // debole: ripasso rapido
  else                    variante = 'cenno';       // medio: solo un promemoria
  return { concetto, titolo: l.titolo, intensita: variante, ...l[variante] };
}
