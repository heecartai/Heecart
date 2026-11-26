import storeData from '../data/store.json';

// The whole store (products, categories, coupons, settings) is one JSON file in the GitHub repo.
// The website is built from it; the CRM edits it by committing to GitHub (see github.js), which
// makes Vercel / Cloudflare rebuild the site automatically.

export const STORE_PATH = 'src/data/store.json';

const bySort = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

export function prepareStore(data, { includeHidden = false } = {}) {
  return {
    ...data,
    products: [...data.products].filter(p => includeHidden || p.active).sort(bySort),
    categories: [...data.categories].sort(bySort),
  };
}

export const store = prepareStore(storeData);

// Returns the coupon if the code is valid and active, otherwise null.
export function findCoupon(code) {
  const clean = code.trim().toUpperCase();
  return storeData.coupons.find(c => c.code === clean && c.active) || null;
}
