export const slugify = text =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

// Makes an id that isn't used by any item in `list` yet.
export function uniqueId(base, list) {
  const taken = new Set(list.map(item => item.id));
  let id = slugify(base) || 'item';
  for (let n = 2; taken.has(id); n++) id = `${slugify(base)}-${n}`;
  return id;
}

// Photos uploaded in this session aren't on the live site until it rebuilds, so the CRM
// shows them from the in-browser copy meanwhile.
const previews = new Map();
export const rememberPreview = (url, dataUrl) => previews.set(url, dataUrl);
export const imgSrc = url => previews.get(url) || url;

// Store mutations: each takes the latest store.json and returns the changed copy.
const upsert = (list, item, key = 'id') =>
  list.some(x => x[key] === item[key]) ? list.map(x => (x[key] === item[key] ? item : x)) : [...list, item];

export const upsertProduct = product => store => ({ ...store, products: upsert(store.products, product) });
export const removeProduct = id => store => ({ ...store, products: store.products.filter(p => p.id !== id) });
export const upsertCategory = category => store => ({ ...store, categories: upsert(store.categories, category) });
export const removeCategory = id => store => ({ ...store, categories: store.categories.filter(c => c.id !== id) });
export const upsertCoupon = coupon => store => ({ ...store, coupons: upsert(store.coupons, coupon, 'code') });
export const removeCoupon = code => store => ({ ...store, coupons: store.coupons.filter(c => c.code !== code) });
export const replaceSettings = settings => store => ({ ...store, settings });
