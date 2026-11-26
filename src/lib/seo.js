// Per-page SEO: title, description, canonical, social tags and structured data (JSON-LD).
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://heecart.heecart-ai.workers.dev').replace(/\/+$/, '');
export const SITE_NAME = 'Heecart Gifts and More';
export const DEFAULT_DESCRIPTION =
  'Corporate gifts in Chennai: custom-branded combo gift sets, pen and keychain sets, diary combos, steel bottles, employee welcome kits and eco bamboo kits. Bulk orders with logo printing and pan-India delivery. Order on WhatsApp.';
export const KEYWORDS =
  'corporate gifts Chennai, corporate gift sets, custom branded gifts, bulk corporate gifts India, employee welcome kit, pen and keychain gift set, diary and pen combo, customised steel bottle, eco bamboo gift kit, personalised gifts with logo, Diwali corporate gifts, return gifts in bulk, promotional gifts, client gifting, Heecart';

function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function setJsonLd(data) {
  let el = document.getElementById('page-jsonld');
  if (!data) return el && el.remove();
  if (!el) {
    el = document.createElement('script');
    el.id = 'page-jsonld';
    el.type = 'application/ld+json';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function applySeo({ title, description = DEFAULT_DESCRIPTION, path = '/', image, jsonLd, noindex = false }) {
  const url = `${SITE_URL}${path === '/' ? '/' : path}`;
  const img = image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : `${SITE_URL}/products/catalog-cover.jpg`;
  document.title = title;
  setMeta('name', 'description', description);
  setMeta('name', 'keywords', KEYWORDS);
  setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
  setLink('canonical', url);
  setMeta('property', 'og:title', title);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image', img);
  setMeta('name', 'twitter:title', title);
  setMeta('name', 'twitter:description', description);
  setMeta('name', 'twitter:image', img);
  setJsonLd(jsonLd);
}
