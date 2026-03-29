// ================================================================
// HUXI App — Hulpfuncties
// Tijd van de dag en seizoensdetectie
// ================================================================

function getRealTod() {
  const h = new Date().getHours();
  return h >= 6 && h < 12 ? "Ochtend" : h >= 12 && h < 17 ? "Middag" : h >= 17 && h < 21 ? "Avond" : "Nacht";
}
function getRealSeason() {
  const m = new Date().getMonth();
  return m >= 2 && m <= 4 ? "Lente" : m >= 5 && m <= 7 ? "Zomer" : m >= 8 && m <= 10 ? "Herfst" : "Winter";
}
