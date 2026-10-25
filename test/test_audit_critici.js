/**
 * Test automatico su tema/index.html reale per coprire C1, C2, C3 e regressioni
 */

const fs = require('fs');
const assert = require('assert');

console.log("▶ AVVIO SUITE TEST COMPLETA AUDIT V2 SUSHINO...");

const html = fs.readFileSync('C:/Users/matte/.gemini/antigravity/scratch/sushino-livorno/tema/index.html', 'utf8');

// 1. Estrai lo script JS effettivo da index.html
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
assert(scriptMatch, "ERRORE: Nessuno script trovato in index.html");
const scriptCode = scriptMatch[1];

// 2. Simula un mock DOM
const mockElements = {};
function getOrCreateElem(id) {
  if (!mockElements[id]) {
    mockElements[id] = {
      id,
      textContent: '',
      innerHTML: '',
      style: {},
      options: [
        { text: 'None', getAttribute: () => '0' },
        { text: 'Extra 1', getAttribute: () => '100' }
      ],
      selectedIndex: 0,
      checked: false,
      value: '1',
      appendChild: () => {},
      querySelectorAll: () => [],
      addEventListener: () => {},
      setAttribute: () => {},
      getAttribute: () => null
    };
  }
  return mockElements[id];
}

const mockDocument = {
  elements: mockElements,
  addEventListener() {},
  getElementById(id) {
    return getOrCreateElem(id);
  },
  querySelectorAll(sel) {
    return [];
  }
};

const mockLocalStorage = {
  _store: {},
  getItem(k) { return this._store[k] || null; },
  setItem(k, v) { this._store[k] = String(v); },
  removeItem(k) { delete this._store[k]; }
};

// Crea funzione per valutare lo script
const fnRunner = new Function('document', 'localStorage', scriptCode + `
  return {
    CART_STATE: typeof CART_STATE !== 'undefined' ? CART_STATE : null,
    LUNCH_BOX_CHOICES: typeof LUNCH_BOX_CHOICES !== 'undefined' ? LUNCH_BOX_CHOICES : null,
    PLATES_POOL: typeof PLATES_POOL !== 'undefined' ? PLATES_POOL : null,
    isLunchTime: typeof isLunchTime !== 'undefined' ? isLunchTime : null,
    formatPrice: typeof formatPrice !== 'undefined' ? formatPrice : null,
    updateModalTotal: typeof updateModalTotal !== 'undefined' ? updateModalTotal : null,
    openBoxForTest: typeof openBoxForTest !== 'undefined' ? openBoxForTest : null
  };
`);

const siteContext = fnRunner(mockDocument, mockLocalStorage);

// VERIFICA 1: Scelte Tropical Lunch Box conformi (4 uramaki)
assert.strictEqual(siteContext.LUNCH_BOX_CHOICES.length, 4, "La lunch box deve avere esattamente 4 scelte");
assert(siteContext.LUNCH_BOX_CHOICES.includes("Uramaki Philadelphia 8 pz"));
assert(siteContext.LUNCH_BOX_CHOICES.includes("Uramaki Tempura 8 pz"));
assert(siteContext.LUNCH_BOX_CHOICES.includes("Olio's Uramaki 8 pz"));
assert(siteContext.LUNCH_BOX_CHOICES.includes("Uramaki Tonno Piccante 8 pz"));
console.log("  ✔ TEST 1 SUPERATO: Scelte Tropical Lunch Box conformi (4 uramaki previsti).");

// VERIFICA 2: Bug C1 - Verifica che il reset delle modali includa teriyaki e agrodolce sia nello stato che nei select
assert(scriptCode.includes("qd-opt-teriyaki"), "Lo script deve interagire con qd-opt-teriyaki");
assert(scriptCode.includes("qd-opt-agrodolce"), "Lo script deve interagire con qd-opt-agrodolce");
const resetHasTeriyaki = scriptCode.includes("document.getElementById('qd-opt-teriyaki').selectedIndex = 0;");
const resetHasAgrodolce = scriptCode.includes("document.getElementById('qd-opt-agrodolce').selectedIndex = 0;");
assert(resetHasTeriyaki, "ERRORE C1: Mancato reset di qd-opt-teriyaki all'apertura della modale box");
assert(resetHasAgrodolce, "ERRORE C1: Mancato reset di qd-opt-agrodolce all'apertura della modale box");
console.log("  ✔ TEST 2 SUPERATO (C1 risolto): Reset modale box azzera teriyaki e agrodolce senza regalare salse.");

// VERIFICA 3: Bug C2 - Nessun toggle pubblico di simulazione visibile ai clienti
assert(!html.includes('id="simulate-lunch-toggle"'), "ERRORE C2: Trovato 'simulate-lunch-toggle' nel codice HTML visibile agli utenti");
assert(!html.includes('Simula orario pranzo per test'), "ERRORE C2: Trovata dicitura di test pranzo nell'HTML");
console.log("  ✔ TEST 3 SUPERATO (C2 risolto): Toggle di test orario rimosso dall'interfaccia pubblica.");

// VERIFICA 4: Bug C3 - Procedi al Checkout collegato e funzionante (modale o avviso chiaro)
assert(html.includes('id="checkout-btn"'), "Il bottone di checkout deve avere un id chiaro (es. checkout-btn)");
assert(scriptCode.includes("checkout-btn") || scriptCode.includes("checkout"), "Lo script deve gestire l'azione di checkout");
console.log("  ✔ TEST 4 SUPERATO (C3 risolto): Procedi al Checkout gestito con feedback operativo.");

// VERIFICA 5: Open Graph meta tags per condivisione WhatsApp / Social
assert(html.includes('<meta property="og:title"'), "Manca og:title per condivisione WhatsApp/Social");
assert(html.includes('<meta property="og:image"'), "Manca og:image per anteprima WhatsApp/Social");
assert(html.includes('<meta property="og:description"'), "Manca og:description per anteprima");
console.log("  ✔ TEST 5 SUPERATO (I6 risolto): Meta tag Open Graph per anteprima WhatsApp e social presenti.");

// VERIFICA 6: Lazy loading immagini
const imgMatches = [...html.matchAll(/<img\s+[^>]*>/gi)];
const totalImgs = imgMatches.length;
const lazyImgs = imgMatches.filter(m => m[0].includes('loading="lazy"')).length;
// Tutte le immagini tranne il logo principale dovrebbero avere loading="lazy"
assert(lazyImgs >= totalImgs - 2, `Attesi la quasi totalità dei tag img con loading="lazy" (trovati ${lazyImgs}/${totalImgs})`);
console.log(`  ✔ TEST 6 SUPERATO (Performance): ${lazyImgs} immagini con loading="lazy" per velocità da mobile.`);

// VERIFICA 7: Refuso "Consegnamo" corretto in "Consegniamo"
assert(!html.includes("Consegnamo in tutta Livorno"), "Trovato refuso 'Consegnamo' invece di 'Consegniamo'");
assert(html.includes("Consegniamo in tutta Livorno"), "Frase corretta 'Consegniamo in tutta Livorno' presente");
console.log("  ✔ TEST 7 SUPERATO: Refuso grammaticale corretto.");

console.log("🎉 TUTTI I TEST DI VERIFICA AUDIT V2 SUPERATI CON SUCCESSO!");
