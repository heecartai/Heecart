import { STORE_PATH } from './store';

// The CRM saves by committing straight to the GitHub repo through the GitHub REST API.
// Each save is one commit holding the updated store.json plus any newly uploaded photos.
// Requests go through the Cloudflare worker (worker/index.js), which checks the login
// session and adds the GitHub token on the server, so the browser never sees it.

export const BRANCH = import.meta.env.VITE_GITHUB_BRANCH || 'main';

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api/${path}`, {
    method,
    cache: 'no-store',
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'heecart-crm',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    const message =
      detail.error ||
      (res.status === 401 ? 'Please log in again.' :
       res.status === 403 || res.status === 404 ? 'The store could not reach GitHub. Check GITHUB_TOKEN in Cloudflare.' :
       detail.message || `Server error ${res.status}`);
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }
  return res.status === 204 ? null : res.json();
}

const api = (path, options) => request(`github${path}`, options);

export const login = password => request('login', { method: 'POST', body: { password } });
export const logout = () => request('logout', { method: 'POST' }).catch(() => {});
export const checkSession = () => request('session').then(() => true, () => false);

const bytesToBase64 = bytes => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
};
const textToBase64 = text => bytesToBase64(new TextEncoder().encode(text));
const base64ToText = b64 => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, '')), c => c.charCodeAt(0)));

async function headCommit() {
  const ref = await api(`/git/ref/heads/${BRANCH}`);
  return ref.object.sha;
}

async function readStoreAt(commitSha) {
  const file = await api(`/contents/${STORE_PATH}?ref=${commitSha}`);
  return JSON.parse(base64ToText(file.content));
}

// Latest store.json on GitHub (which can be newer than what the live site was built from).
export async function fetchStore() {
  return readStoreAt(await headCommit());
}

// Reads the latest store, applies `mutate`, and commits the result together with `files`
// ([{ path, base64 }], e.g. uploaded photos). Retries once if someone else saved meanwhile.
export async function commitStore(mutate, message, files = [], attempt = 1) {
  const parent = await headCommit();
  const current = await readStoreAt(parent);
  const next = mutate(structuredClone(current));

  const { tree: baseTree } = await api(`/git/commits/${parent}`);
  const blobs = await Promise.all(
    [{ path: STORE_PATH, base64: textToBase64(`${JSON.stringify(next, null, 2)}\n`) }, ...files].map(async file => {
      const blob = await api('/git/blobs', { method: 'POST', body: { content: file.base64, encoding: 'base64' } });
      return { path: file.path, mode: '100644', type: 'blob', sha: blob.sha };
    }),
  );
  const tree = await api('/git/trees', { method: 'POST', body: { base_tree: baseTree.sha, tree: blobs } });
  const commit = await api('/git/commits', { method: 'POST', body: { message: `CRM: ${message}`, tree: tree.sha, parents: [parent] } });

  try {
    await api(`/git/refs/heads/${BRANCH}`, { method: 'PATCH', body: { sha: commit.sha } });
  } catch (err) {
    if (err.status === 422 && attempt < 3) return commitStore(mutate, message, files, attempt + 1);
    throw err;
  }
  return next;
}

// Shrinks a photo in the browser so phone camera pictures stay small in the repo.
// Returns the repo path for it, its base64 content, and a data URL for previewing before the site rebuilds.
export function preparePhoto(file, maxSize = 1200, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      resolve({ path: `public/uploads/${name}`, url: `/uploads/${name}`, base64: dataUrl.split(',')[1], dataUrl });
    };
    img.onerror = () => reject(new Error('That file is not an image'));
    img.src = URL.createObjectURL(file);
  });
}
