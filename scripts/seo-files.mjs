// Runs before the build: writes public/sitemap.xml (home, shop, every active product, policies) and public/robots.txt.
import { readFileSync, writeFileSync } from 'node:fs';

const site = (process.env.VITE_SITE_URL || 'https://heecart.heecart-ai.workers.dev').replace(/\/+$/, '');
const store = JSON.parse(readFileSync(new URL('../src/data/store.json', import.meta.url), 'utf8'));
const policies = readFileSync(new URL('../src/components/PolicyPage.jsx', import.meta.url), 'utf8')
  .match(/slug:\s*'([^']+)'/g)?.map(m => m.match(/'([^']+)'/)[1]) ?? [];

const urls = [
  ['/', '1.0'],
  ['/shop', '0.9'],
  ...store.products.filter(p => p.active !== false).map(p => [`/p/${encodeURIComponent(p.id)}`, '0.8']),
  ...policies.map(s => [`/${s}`, '0.3']),
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map(([u, pr]) => `  <url><loc>${site}${u}</loc><priority>${pr}</priority></url>`)
  .join('\n')}\n</urlset>\n`;
writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
writeFileSync(new URL('../public/robots.txt', import.meta.url), `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site}/sitemap.xml\n`);
console.log(`sitemap: ${urls.length} urls`);
