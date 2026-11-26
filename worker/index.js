// Cloudflare Worker: serves the built site from ./dist and runs the small CRM backend.
//
// The store manager signs in with a password (secret CRM_PASSWORD). The worker then lets the
// CRM talk to GitHub through /api/github/*, adding the GitHub token (secret GITHUB_TOKEN) on
// the server, so the token never reaches the browser and the manager needs no GitHub account.
//
// Secrets to set in Cloudflare (Settings → Variables and Secrets):
//   CRM_PASSWORD    the store manager's password
//   SESSION_SECRET  any long random string, used to sign login sessions
//   GITHUB_TOKEN    fine-grained token with Contents: Read and write on the repo

const COOKIE = 'hc_session';
const SESSION_DAYS = 30;

// Only these GitHub endpoints of the one repo can be reached through the proxy.
const ALLOWED_GITHUB_PATH = /^(git\/(ref|refs|commits|blobs|trees)(\/[\w./-]*)?|contents\/[\w./-]+)$/;

const encoder = new TextEncoder();

const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });

async function hmac(secret, text) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(text));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Compares two strings in constant time by comparing their HMACs.
async function safeEqual(secret, a, b) {
  const [x, y] = await Promise.all([hmac(secret, a), hmac(secret, b)]);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.min(x.length, y.length); i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0;
}

function readCookie(request, name) {
  const match = (request.headers.get('Cookie') || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? match[1] : '';
}

async function hasSession(request, env) {
  const [expires, sig] = readCookie(request, COOKIE).split('.');
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  return safeEqual(env.SESSION_SECRET, sig, await hmac(env.SESSION_SECRET, `session:${expires}`));
}

const sessionCookie = (value, maxAge) =>
  `${COOKIE}=${value}; Path=/api; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;

async function login(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  if (env.LOGIN_LIMITER) {
    const { success } = await env.LOGIN_LIMITER.limit({ key: ip });
    if (!success) return json({ error: 'Too many attempts. Please wait a minute and try again.' }, 429);
  }
  const { password = '' } = await request.json().catch(() => ({}));
  if (!(await safeEqual(env.SESSION_SECRET, String(password), env.CRM_PASSWORD))) {
    await new Promise(r => setTimeout(r, 800));
    return json({ error: 'Wrong password.' }, 401);
  }
  const expires = Date.now() + SESSION_DAYS * 86400000;
  const value = `${expires}.${await hmac(env.SESSION_SECRET, `session:${expires}`)}`;
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(value, SESSION_DAYS * 86400) });
}

async function proxyGithub(request, env, path, search) {
  if (!ALLOWED_GITHUB_PATH.test(path)) return json({ error: 'Not allowed' }, 403);
  const repo = env.GITHUB_REPO || 'boobesh2912/HEECART';
  const res = await fetch(`https://api.github.com/repos/${repo}/${path}${search}`, {
    method: request.method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'heecart-crm',
      ...(request.method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
    },
    body: request.method === 'GET' ? undefined : await request.text(),
  });
  // A 401 here means the GitHub token is wrong, not that the manager's login expired.
  if (res.status === 401) {
    return json({ error: 'The GitHub token (GITHUB_TOKEN in Cloudflare) is wrong or has expired.' }, 502);
  }
  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function handleApi(request, env, url) {
  if (!env.CRM_PASSWORD || !env.SESSION_SECRET || !env.GITHUB_TOKEN) {
    return json({ error: 'The store manager is not set up yet: add CRM_PASSWORD, SESSION_SECRET and GITHUB_TOKEN in Cloudflare.' }, 503);
  }
  // Blocks cross-site form posts: browsers only send this header from our own scripts.
  if (request.method !== 'GET' && request.headers.get('X-Requested-With') !== 'heecart-crm') {
    return json({ error: 'Bad request' }, 400);
  }

  const route = url.pathname.slice('/api/'.length);
  if (route === 'login' && request.method === 'POST') return login(request, env);
  if (route === 'logout' && request.method === 'POST') return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', 0) });

  if (!(await hasSession(request, env))) return json({ error: 'Please log in again.' }, 401);
  if (route === 'session') return json({ ok: true });
  if (route.startsWith('github/')) return proxyGithub(request, env, route.slice('github/'.length), url.search);
  return json({ error: 'Not found' }, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) return handleApi(request, env, url);
    return env.ASSETS.fetch(request);
  },
};
