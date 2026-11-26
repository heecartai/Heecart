// All products, categories, coupons and settings live in store.json, which the CRM edits.
// (It was first filled in from the Heecart product catalog PDF. In that PDF "Diary + Pen Combo - 4.0"
// appears twice, so the gold-edge one is called 7.0 here.)

// Every catalog page uses the same four quantity slabs; the CRM uses these for new products.
export const TIER_SLABS = [
  { min: 1, label: '1 Pc' },
  { min: 5, label: '5 – 10 Pcs' },
  { min: 30, label: '30 – 50 Pcs' },
  { min: 100, label: '100 Pcs +' },
];
