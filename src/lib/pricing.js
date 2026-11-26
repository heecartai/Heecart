export const formatINR = amount =>
  `₹${Number(amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

export const sortedTiers = product => [...(product.tiers || [])].filter(t => t.price != null).sort((a, b) => a.min - b.min);

export const minOrderQty = product => sortedTiers(product)[0]?.min ?? 1;

// Per-piece price for a quantity: the highest slab whose minimum the quantity reaches.
// Quantities between printed slabs (e.g. 20 pcs) get the slab below; the final quote is on WhatsApp.
export function unitPrice(product, qty) {
  const tier = sortedTiers(product).filter(t => qty >= t.min).pop();
  return tier ? tier.price : null;
}

export function activeTierIndex(product, qty) {
  const tiers = sortedTiers(product);
  let index = -1;
  tiers.forEach((t, i) => { if (qty >= t.min) index = i; });
  return index;
}

// The first slab's price is the "regular" price that bulk savings are measured against.
export const startingPrice = product => sortedTiers(product)[0]?.price ?? null;

export const lowestPrice = product => {
  const prices = sortedTiers(product).map(t => t.price);
  return prices.length ? Math.min(...prices) : null;
};

export const savingsPercent = (product, price) => {
  const base = startingPrice(product);
  return base && price < base ? Math.round(((base - price) / base) * 100) : 0;
};

export const maxSavingsPercent = product => savingsPercent(product, lowestPrice(product));

export function couponDiscount(coupon, subtotal) {
  if (!coupon || subtotal < (coupon.min_amount || 0)) return 0;
  const raw = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
  return Math.min(Math.round(raw), subtotal);
}

export function cartTotals(items, coupon) {
  const subtotal = items.reduce((sum, i) => sum + (unitPrice(i.product, i.qty) || 0) * i.qty, 0);
  const regular = items.reduce((sum, i) => sum + (startingPrice(i.product) || 0) * i.qty, 0);
  const discount = couponDiscount(coupon, subtotal);
  return { subtotal, bulkSavings: Math.max(0, regular - subtotal), discount, total: subtotal - discount };
}
