# CONTESTO PROGETTO: SUSHINO (Livorno)

Questo file contiene tutte le regole di business, architettura e istruzioni operative per lo sviluppo del nuovo sistema proprietario di Sushino.

## 0. REGOLE PER L'AI
- Rispondere sempre in italiano con linguaggio chiaro e semplice (niente gergo non spiegato).
- Lavorare a passi piccoli: spiegare in 3-5 righe prima di procedere, e riepilogare dopo ogni modifica (cosa è cambiato, come provarlo, cosa deve succedere, cosa può andare storto).
- Mai toccare il sito live, lavorare solo su dev store / tema duplicato.
- Commit Git frequenti in italiano.
- Non inventare dati di business (prezzi, orari, regole). Se manca qualcosa, segnalarlo e chiedere conferma.
- Mai scrivere credenziali, password o chiavi API nel codice.
- Prezzi sempre in centesimi interi (EUR).
- Fuso orario: Europe/Rome.
- Mobile-first per tutti i componenti di ordinazione.

---

## 1. OBIETTIVO
Sostituire la vecchia piattaforma WordPress/DeliveryAggregator con:
1. Frontend ordinazione delivery e asporto su Shopify.
2. App custom / Cart Transform per risolvere il bug delle box a slot e gestire le validazioni.
3. CRM unico unificato (delivery + sala).
4. Agenda prenotazioni sala con garanzia carta (prevenzione no-show).
5. Automazioni WhatsApp per ordini, prenotazioni e comunicazioni di servizio.

---

## 2. ARCHITETTURA
- **Frontend:** Tema Shopify Online Store 2.0 (base Dawn) in Liquid/CSS/JS.
- **Backend:** Shopify (ordini, clienti, pagamenti, consegne locali).
- **Logica Box:** App Shopify CLI con Cart Transform Function.
- **Agenda / CRM:** Fase A con strumento pronto integrato, eventuale Fase C custom (Next.js + Supabase).
- **Pagamenti:** Shopify Payments / Contanti alla consegna; Stripe per garanzia prenotazioni sala.
- **Comunicazioni:** WhatsApp Business API + Automazioni Flow / n8n.

---

## 3. STRUTTURA DELLE CARTELLE
- `/tema`: File del tema Shopify (Liquid, CSS, JS).
- `/app`: Codice dell'app Shopify (funzioni di carrello, validazioni).
- `/automazioni`: Workflow esportati per WhatsApp / Flow / n8n.
- `/docs`: Documentazione, regole operative, schemi dati.
- `/test`: Test automatici e verifiche carrello/prenotazioni.

---

## 4. INFORMAZIONI DA CONFERMARE (Sezione 12)
- Esistenza e prezzo Box da 10 piatti.
- Regole di selezione piatti nelle box ed eventuali supplementi.
- Vini in vendita e prezzi definitivi.
- Tabella ufficiale dei 14 allergeni e piatti mancanti.
- Orari precisi del servizio (pranzo e cena giorno per giorno).
- Zone di consegna (CAP/quartieri), costi e ordine minimo.
- Configurazione tavoli sala, turni e importo penale no-show.
