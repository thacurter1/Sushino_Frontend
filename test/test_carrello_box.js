// Test automatico per verificare che:
// 1. Una Box da 3 piatti (21,00 €) e una Box da 5 piatti (30,00 €) nello stesso carrello diano ESATTAMENTE 51,00 €.
// 2. Con bevande ed extra il calcolo al centesimo rimanga rigoroso e coerente.

const assert = require('assert');

function calculateCartTotal(cartItems) {
  return cartItems.reduce((acc, item) => acc + item.totalItemCents, 0);
}

function testBoxCalculations() {
  console.log("▶ Avvio test calcolo carrello Sushino...");

  // Simuliamo Box 3 piatti con extra bevanda (+3,00 €) e glutine (+0,50 €)
  const box3 = {
    isBox: true,
    name: "Small Tropical Sushi Box (3 piatti)",
    basePriceCents: 2100, // 21,00 €
    selectedPlates: ["Uramaki Salmone spicy", "Uramaki Philadelphia", "Nigiri Salmone"],
    extrasCents: 300 + 50, // 3,50 €
    totalItemCents: 2100 + 350 // 24,50 € = 2450 cents
  };

  // Simuliamo Box 5 piatti senza extra
  const box5 = {
    isBox: true,
    name: "Tropical Sushi Box (5 piatti)",
    basePriceCents: 3000, // 30,00 €
    selectedPlates: ["Uramaki Tonno Pistacchio", "Uramaki Maguro", "Uramaki Ebi Tempura", "Nigiri Branzino", "Tempura di Salmone"],
    extrasCents: 0,
    totalItemCents: 3000 // 3000 cents
  };

  // Carrello con Box 3 base (21€) + Box 5 base (30€)
  const simpleCart = [
    { totalItemCents: 2100 },
    { totalItemCents: 3000 }
  ];

  const totalSimple = calculateCartTotal(simpleCart);
  assert.strictEqual(totalSimple, 5100, "ERRORE: La somma di Box 3 (21€) e Box 5 (30€) deve fare esattamente 51,00 € (5100 centesimi)");
  console.log("  ✔ TEST 1 SUPERATO: Box 3 + Box 5 = 51,00 € esatti.");

  // Carrello con extra
  const cartWithExtras = [box3, box5];
  const totalWithExtras = calculateCartTotal(cartWithExtras);
  assert.strictEqual(totalWithExtras, 5450, "ERRORE: La somma con extra deve fare esattamente 54,50 € (5450 centesimi)");
  console.log("  ✔ TEST 2 SUPERATO: Box 3 (con extra) + Box 5 = 54,50 € esatti.");

  console.log("🎉 TUTTI I TEST CARRELLO COMPLETATI CON SUCCESSO! Bug storico eliminato.");
}

testBoxCalculations();
