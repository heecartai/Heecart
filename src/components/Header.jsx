import React, { useEffect, useRef, useState } from 'react';
import { Phone, Search, ShoppingCart, X } from 'lucide-react';
import { linkHandler, navigate } from '../lib/router';
import { freeShippingOffer, offerScope } from '../lib/offer';
import { formatINR } from '../lib/pricing';
import { shopHref } from './ShopPage';

function SearchBox({ search, className = '' }) {
  const initial = new URLSearchParams(search).get('q') || '';
  const [value, setValue] = useState(initial);

  useEffect(() => setValue(initial), [initial]);

  const submit = text => {
    // On the shop page keep the other filters; from anywhere else start a fresh search.
    const onShop = window.location.pathname === '/shop';
    const params = new URLSearchParams(onShop ? window.location.search : '');
    if (text.trim()) params.set('q', text.trim());
    else params.delete('q');
    navigate(shopHref(Object.fromEntries(params)), { replace: onShop, keepScroll: onShop });
  };

  return (
    <form className={`relative ${className}`} onSubmit={e => { e.preventDefault(); submit(value); }} role="search">
      <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/60" />
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Search diaries, bottles, pens, eco kits…"
        className="input min-h-11 rounded-full bg-cream/60 py-2.5 pl-10 pr-9"
        aria-label="Search products"
      />
      {value && (
        <button type="button" onClick={() => { setValue(''); submit(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/60 hover:text-ink" aria-label="Clear search">
          <X size={16} />
        </button>
      )}
    </form>
  );
}

// Rotating messages in the top bar.
function Announcements({ settings }) {
  const offer = freeShippingOffer(settings);
  const messages = [
    offer && `FREE shipping ${offerScope(offer, formatINR)}${offer.daily ? ' · Order today' : ''}`,
    settings.trust_orders && `${settings.trust_orders} orders delivered${settings.trust_since ? ` since ${settings.trust_since}` : ''}`,
    ...String(settings.announcement || '').split('·').map(s => s.trim()),
  ].filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length < 2) return;
    const timer = setInterval(() => setIndex(i => (i + 1) % messages.length), 3500);
    return () => clearInterval(timer);
  }, [messages.length]);

  if (!messages.length) return null;
  return (
    <div className="bg-ink px-4 py-2 text-center text-xs font-semibold tracking-wide text-gold-400 sm:text-xs" aria-live="polite">
      <span key={index} className="animate-fade-in inline-block">{messages[index % messages.length]}</span>
    </div>
  );
}

const NAV = [
  { label: 'Shop all', href: '/shop' },
  { label: 'Bestsellers', href: '/#bestsellers' },
  { label: 'Bulk savings', href: '/#bulk-savings' },
  { label: 'How it works', href: '/#how-to-order' },
];

function goToSection(e, href) {
  e.preventDefault();
  if (!href.includes('#')) return navigate(href);
  const id = href.split('#')[1];
  if (window.location.pathname !== '/') navigate('/');
  requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }));
}

export default function Header({ settings, search, cartCount, onOpenCart }) {
  const ref = useRef(null);

  // Shares the header's height as --header-h so the shop's sticky filter bar sits right under it.
  useEffect(() => {
    const el = ref.current;
    const update = () => document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header ref={ref} className="sticky top-0 z-40">
      <Announcements settings={settings} />
      <div className="border-b border-ink/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <a href="/" onClick={linkHandler('/')} className="shrink-0" aria-label="Heecart home">
            <img src="/logo.png" alt="Heecart Gifts and More" className="h-10 w-auto sm:h-12" />
          </a>

          <nav className="hidden items-center gap-1 xl:flex">
            {NAV.map(item => (
              <a key={item.label} href={item.href} onClick={e => goToSection(e, item.href)} className="rounded-full px-3 py-2 text-sm font-semibold text-ink/70 hover:bg-cream hover:text-ink">
                {item.label}
              </a>
            ))}
          </nav>

          <SearchBox search={search} className="mx-auto hidden max-w-sm flex-1 md:block" />

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <a href={`tel:+${settings.whatsapp}`} className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-ink hover:bg-cream lg:flex">
              <Phone size={16} className="text-gold-600" />
              {settings.phone_display}
            </a>
            <button onClick={onOpenCart} className="relative flex min-h-11 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-700" aria-label={`Cart, ${cartCount} items`}>
              <ShoppingCart size={17} className="text-gold-400" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold-500 px-1 text-xs font-bold text-ink">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
        <div className="px-4 pb-3 md:hidden">
          <SearchBox search={search} />
        </div>
      </div>
    </header>
  );
}
