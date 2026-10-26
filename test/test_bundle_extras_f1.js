const fs = require('fs');
const assert = require('assert');

console.log("▶ AVVIO TEST TDD GESTIONE BUNDLE MULTI-ITEM F1...");

const drawerCode = fs.readFileSync('C:/Users/matte/.gemini/antigravity/scratch/sushino-livorno/shopify-theme/snippets/cart-drawer.liquid', 'utf8');
const modalCode = fs.readFileSync('C:/Users/matte/.gemini/antigravity/scratch/sushino-livorno/shopify-theme/snippets/slot-box-modal.liquid', 'utf8');

// TEST 1: cart-drawer deve supportare l'endpoint /cart/add.js con payload items: [...]
assert(drawerCode.includes("addMultipleItemsToShopify"), "ERRORE F1: Manca la funzione per inviare array di articoli multipli (Box + Extra reali a pagamento)");
console.log("✔ Test 1: Supporto addMultipleItemsToShopify presente");

// TEST 2: slot-box-modal deve creare item separati per gli extra selezionati a pagamento
assert(modalCode.includes("extraItems"), "ERRORE F1: Manca la costruzione della lista extra a pagamento collegati alla box");
console.log("✔ Test 2: Costruzione extra items reali presente");

// TEST 3: Gli extra devono avere _box_parent o proprietà di collegamento per chiarezza di comanda
assert(modalCode.includes("_box_ref") || modalCode.includes("_box_id"), "ERRORE F1: Gli extra devono avere un identificativo di associazione alla box");
console.log("✔ Test 3: Associazione identificativa tra Box ed Extra presente");
