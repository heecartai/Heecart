# Heecart Gifts and More

The website for Heecart's corporate combo gifts. Customers browse the catalog, see bulk prices, and send their order on WhatsApp (90877 78321). Payment happens over WhatsApp by GPay / UPI.

- **Storefront** (`/`): all catalog products with photos and the four price slabs, a product page per gift set (shareable link `/p/<id>`), and a cart whose checkout sends the order and delivery address in one WhatsApp message.
- **CRM** (`/venkatesh`): add, edit, hide and delete products, change prices and photos, and manage categories, coupons and the store's contact details.

Built with React, Vite and Tailwind. There's no database. Everything lives in this GitHub repo.

## How the CRM saves changes

All store data is in [`src/data/store.json`](src/data/store.json). When the store manager saves in the CRM, it **commits that file (plus any new photos in `public/uploads/`) to this GitHub repo**. Cloudflare sees the commit and rebuilds the site, so the change is live in about **1–2 minutes**. Every change is in the git history, so any mistake can be undone.

The store manager only needs **a password**, not a GitHub account. The Cloudflare worker ([`worker/index.js`](worker/index.js)) checks the password, keeps the device signed in for 30 days, and talks to GitHub using a token stored as a Cloudflare secret. The token never reaches the browser. Login attempts are limited to 5 per minute.

## Deploying on Cloudflare (free)

1. *Workers & Pages → Create → Continue with GitHub → `HEECART`.*
2. Project name `heecart`. Build command `npm run build`. Deploy command `npx wrangler deploy` (the default). Leave the API token as "create new token".
3. Deploy. The site goes live at `https://heecart.<your-subdomain>.workers.dev`.
4. In the worker go to **Settings → Variables and Secrets** and add three **Secrets**:
   - `CRM_PASSWORD`: the store manager's password (long, e.g. four random words).
   - `SESSION_SECRET`: any long random string. Changing it signs everyone out.
   - `GITHUB_TOKEN`: a fine-grained token (see below).

### The GitHub token (one time)

1. On GitHub: **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Name it `Heecart CRM`, choose an expiry, and set **Repository access** to "Only select repositories" → `heecartai/Heecart`.
3. **Permissions → Repository permissions → Contents: Read and write.** Nothing else.
4. Copy the `github_pat_…` value into the `GITHUB_TOKEN` secret. When it expires, make a new one and replace the secret.

## Running locally

```bash
npm install
npm run dev
```

http://localhost:3000 is the site. For the CRM, create a `.dev.vars` file (git-ignored) with `CRM_PASSWORD`, `SESSION_SECRET` and `GITHUB_TOKEN`, run `npm run dev:api` in a second terminal, and open http://localhost:3000/venkatesh. The local CRM saves to GitHub too. Run `git pull` to see those changes locally.

## Changing the CRM link

Add a build variable `VITE_CRM_PATH` (e.g. `heecart-admin-2026`) in Cloudflare (*Settings → Build → Variables*) and in `.env`, then redeploy. The page is also blocked from search engines.

## Project layout

```
src/data/store.json   products, categories, coupons, settings (edited by the CRM)
public/products/      product photos from the catalog PDF
public/uploads/       photos uploaded through the CRM
src/components/       storefront
src/crm/              CRM
src/lib/github.js     how the CRM commits to GitHub
worker/index.js       Cloudflare worker: serves the site, CRM login, GitHub proxy
src/lib/whatsapp.js   the WhatsApp order message
```
