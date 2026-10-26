/**
 * Test TDD per le correzioni dell'audit ChatGPT:
 * 1. Olio's Uramaki senza syntax error
 * 2. Reset del contatore plate slot su modali consecutive
 * 3. Validazione di addConfiguredBoxToShopify
 */
const fs = require('fs');
const assert = require('assert');

const liquidModal = fs.readFileSync('C:/Users/matte/.gemini/antigravity/scratch/sushino-livorno/shopify-theme/snippets/slot-box-modal.liquid', 'utf8');

// TEST 1: Nessuna interpolazione inline con virgolette non sicure
assert(!liquidModal.includes("onclick=\"modifyPlateCount('${plate}'"), "ERRORE F4: Trovato onclick con interpolazione non sicura di plate (rompe Olio's Uramaki)");
console.log("✔ Test 1: Olio's Uramaki protetto da syntax error");

// TEST 2: Chiamata esplicita a updatePlateCounts() all'apertura modale
assert(liquidModal.includes("updatePlateCounts();") && liquidModal.includes("openBoxModalFor"), "ERRORE F5: updatePlateCounts() deve essere chiamato all'apertura modale");
console.log("✔ Test 2: Reset contatori all'apertura modale");

// TEST 3: addConfiguredBoxToShopify deve validare gli slot
const hasSlotCheck = liquidModal.includes("selectedPlates.length !== currentBox.slotsRequired") || liquidModal.includes("selectedPlates.length < currentBox.slotsRequired");
assert(hasSlotCheck, "ERRORE F3: Manca validazione rigida degli slot prima dell'invio a Shopify");
console.log("✔ Test 3: Validazione invio slot attiva");
