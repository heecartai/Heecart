import React, { useCallback, useEffect, useState } from 'react';
import { ExternalLink, LogOut, Package, RefreshCw, Settings, Tag, Tags } from 'lucide-react';
import { checkSession, commitStore, fetchStore, logout as endSession } from '../lib/github';
import { prepareStore } from '../lib/store';
import Login from './Login';
import ProductsTab from './ProductsTab';
import CategoriesTab from './CategoriesTab';
import CouponsTab from './CouponsTab';
import SettingsTab from './SettingsTab';

const TABS = [
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: Tags },
  { id: 'coupons', label: 'Coupons', icon: Tag },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function CrmApp() {
  const [authed, setAuthed] = useState(null); // null while checking the session
  const [tab, setTab] = useState('products');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    document.title = 'Heecart CRM';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  useEffect(() => {
    checkSession().then(setAuthed);
  }, []);

  const show = raw => setData(prepareStore(raw, { includeHidden: true }));

  const reload = useCallback(async () => {
    try {
      show(await fetchStore());
      setError('');
    } catch (err) {
      if (err.status === 401) setAuthed(false);
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (authed) reload();
  }, [authed, reload]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Every CRM change goes through here: `mutate` receives the latest store.json from GitHub and
  // returns the changed version, which is committed together with any uploaded photos.
  const run = useCallback(async (mutate, message, files = []) => {
    setBusy(true);
    try {
      show(await commitStore(mutate, message, files));
      setNotice(`${message}. Live on the website in about 1–2 minutes.`);
      return true;
    } catch (err) {
      if (err.status === 401) setAuthed(false);
      alert(`Could not save: ${err.message}`);
      return false;
    } finally {
      setBusy(false);
    }
  }, []);

  if (authed === null) return <div className="min-h-screen bg-ink" />;
  if (!authed) return <Login onSuccess={() => setAuthed(true)} />;

  const logout = () => {
    endSession();
    setData(null);
    setAuthed(false);
  };

  const props = { data, run, busy };

  return (
    <div className="min-h-screen bg-[#f6f4ef]">
      <header className="sticky top-0 z-30 bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <span className="rounded-lg bg-cream px-2 py-1"><img src="/logo.png" alt="Heecart" className="h-7" /></span>
          <span className="text-sm font-bold text-gold-400">CRM</span>
          {busy && <span className="flex items-center gap-1.5 text-xs text-white/60"><RefreshCw size={13} className="animate-spin" /> Saving…</span>}
          <div className="ml-auto flex items-center gap-1">
            <a href="/" target="_blank" rel="noopener" className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-white/10">
              <ExternalLink size={14} /> <span className="hidden sm:inline">View site</span>
            </a>
            <button onClick={logout} className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-white/10">
              <LogOut size={14} /> <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
        <nav className="no-scrollbar mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${tab === id ? 'border-gold-500 text-gold-400' : 'border-transparent text-white/60 hover:text-white'}`}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Could not load the store from GitHub: {error} <button onClick={reload} className="font-semibold underline">Try again</button>
          </div>
        )}
        {!data ? (
          !error && <p className="py-20 text-center text-sm text-ink/60">Loading your store…</p>
        ) : (
          <>
            {tab === 'products' && <ProductsTab {...props} />}
            {tab === 'categories' && <CategoriesTab {...props} />}
            {tab === 'coupons' && <CouponsTab {...props} />}
            {tab === 'settings' && <SettingsTab {...props} />}
          </>
        )}
      </main>

      {notice && (
        <div className="animate-fade-in fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl bg-ink px-4 py-3 text-center text-xs font-semibold text-gold-400 shadow-xl">
          {notice}
        </div>
      )}
    </div>
  );
}
