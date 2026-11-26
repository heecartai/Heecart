import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, Check, ChevronDown, Leaf, SearchX, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from './ProductCard';
import { linkHandler, navigate } from '../lib/router';
import { maxSavingsPercent, startingPrice } from '../lib/pricing';

const PAGE_SIZE = 24;

const SORTS = [
  { id: '', label: 'Recommended' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'savings', label: 'Biggest bulk savings' },
];

// Price ranges, matched against the price of a single piece.
const PRICES = [
  { id: 'u500', label: 'Under ₹500', test: p => p < 500 },
  { id: '500-999', label: '₹500 – ₹999', test: p => p >= 500 && p < 1000 },
  { id: '1000-1499', label: '₹1,000 – ₹1,499', test: p => p >= 1000 && p < 1500 },
  { id: '1500', label: '₹1,500 & above', test: p => p >= 1500 },
];

// Link to the shop with the given filters, e.g. shopHref({ c: 'diary-pen' }).
export function shopHref(params = {}) {
  const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
  return `/shop${qs ? `?${qs}` : ''}`;
}

function readFilters(search) {
  const params = new URLSearchParams(search);
  return {
    c: (params.get('c') || '').split(',').filter(Boolean),
    price: params.get('price') || '',
    eco: params.get('eco') === '1',
    sort: params.get('sort') || '',
    q: params.get('q') || '',
  };
}

function writeFilters(filters) {
  navigate(
    shopHref({ q: filters.q, c: filters.c.join(','), price: filters.price, eco: filters.eco ? '1' : '', sort: filters.sort }),
    { replace: true, keepScroll: true },
  );
}

const activeCount = f => f.c.length + (f.price ? 1 : 0) + (f.eco ? 1 : 0);

function applyFilters(products, f) {
  const words = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  const range = PRICES.find(p => p.id === f.price);
  const list = products.filter(p => {
    if (f.c.length && !f.c.includes(p.category)) return false;
    if (f.eco && !p.tags?.includes('eco')) return false;
    if (range && !range.test(startingPrice(p) ?? 0)) return false;
    if (!words.length) return true;
    const haystack = [p.name, p.set_type, p.description, ...(p.includes || []), ...(p.tags || [])].join(' ').toLowerCase();
    return words.every(word => haystack.includes(word));
  });
  if (f.sort === 'price-asc') list.sort((a, b) => (startingPrice(a) ?? 0) - (startingPrice(b) ?? 0));
  if (f.sort === 'price-desc') list.sort((a, b) => (startingPrice(b) ?? 0) - (startingPrice(a) ?? 0));
  if (f.sort === 'savings') list.sort((a, b) => maxSavingsPercent(b) - maxSavingsPercent(a));
  return list;
}

function CheckRow({ checked, onChange, children, radio }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 py-2 text-sm">
      <input type={radio ? 'radio' : 'checkbox'} checked={checked} onChange={onChange} className="peer sr-only" />
      <span className={`grid h-5 w-5 shrink-0 place-items-center border-2 transition peer-focus-visible:ring-2 peer-focus-visible:ring-gold-500/40 ${radio ? 'rounded-full' : 'rounded-md'} ${checked ? 'border-ink bg-ink text-gold-400' : 'border-ink/25 bg-white'}`}>
        {checked && <Check size={13} strokeWidth={3} />}
      </span>
      <span className={checked ? 'font-semibold' : 'text-ink/75'}>{children}</span>
    </label>
  );
}

// The filter options, shared by the desktop sidebar and the mobile filter sheet.
function FilterGroups({ filters, setFilters, categories, only }) {
  const toggleCategory = id =>
    setFilters({ ...filters, c: filters.c.includes(id) ? filters.c.filter(c => c !== id) : [...filters.c, id] });

  const groups = {
    category: (
      <div>
        {categories.map(c => (
          <CheckRow key={c.id} checked={filters.c.includes(c.id)} onChange={() => toggleCategory(c.id)}>{c.name}</CheckRow>
        ))}
      </div>
    ),
    price: (
      <div>
        {PRICES.map(p => (
          <CheckRow key={p.id} radio checked={filters.price === p.id} onChange={() => setFilters({ ...filters, price: filters.price === p.id ? '' : p.id })}>
            {p.label}
          </CheckRow>
        ))}
        <p className="mt-1 text-xs text-ink/60">Price for 1 piece. Bulk orders cost less.</p>
      </div>
    ),
    eco: (
      <CheckRow checked={filters.eco} onChange={() => setFilters({ ...filters, eco: !filters.eco })}>
        <span className="inline-flex items-center gap-1.5"><Leaf size={14} className="text-green-700" /> Eco · Bamboo & cork</span>
      </CheckRow>
    ),
  };
  return only ? groups[only] : groups;
}

const FILTER_TABS = [
  { id: 'category', label: 'Category' },
  { id: 'price', label: 'Price' },
  { id: 'eco', label: 'Eco-friendly' },
];

function Sidebar({ filters, categories }) {
  const groups = FilterGroups({ filters, setFilters: writeFilters, categories });
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-[calc(var(--header-h,140px)+1rem)] space-y-6 rounded-2xl border border-ink/10 bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-extrabold uppercase tracking-wider">Filters</p>
          {activeCount(filters) > 0 && (
            <button onClick={() => writeFilters({ ...filters, c: [], price: '', eco: false })} className="text-xs font-bold text-gold-800 hover:underline">Clear all</button>
          )}
        </div>
        {FILTER_TABS.map(tab => (
          <div key={tab.id} className="border-t border-ink/10 pt-4">
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-ink/60">{tab.label}</p>
            {groups[tab.id]}
          </div>
        ))}
      </div>
    </aside>
  );
}

// Bottom sheet for phones.
function Sheet({ title, onClose, children, footer, full }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/60" onClick={onClose} />
      <div className={`animate-fade-in relative flex w-full flex-col rounded-t-3xl bg-white ${full ? 'h-[85vh]' : 'max-h-[85vh]'}`}>
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <p className="text-base font-extrabold">{title}</p>
          <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full hover:bg-cream" aria-label="Close"><X size={18} /></button>
        </div>
        {children}
        {footer}
      </div>
    </div>
  );
}

function SortSheet({ filters, onClose }) {
  return (
    <Sheet title="Sort by" onClose={onClose}>
      <div className="px-5 pb-6 pt-2">
        {SORTS.map(s => (
          <CheckRow key={s.id} radio checked={filters.sort === s.id} onChange={() => { writeFilters({ ...filters, sort: s.id }); onClose(); }}>
            {s.label}
          </CheckRow>
        ))}
      </div>
    </Sheet>
  );
}

// Flipkart-style filter sheet: filter types on the left, options on the right, applied on "Apply".
function FilterSheet({ filters, categories, products, onClose }) {
  const [draft, setDraft] = useState(filters);
  const [tab, setTab] = useState('category');
  const matches = useMemo(() => applyFilters(products, draft).length, [products, draft]);

  const footer = (
    <div className="flex items-center gap-3 border-t border-ink/10 px-5 py-3">
      <button onClick={() => setDraft({ ...draft, c: [], price: '', eco: false })} className="flex-1 py-3 text-sm font-bold text-ink/60">Clear all</button>
      <button onClick={() => { writeFilters(draft); onClose(); }} className="btn-gold flex-[2]" disabled={!matches}>
        {matches ? 'Show results' : 'No gifts match'}
      </button>
    </div>
  );

  return (
    <Sheet title="Filters" onClose={onClose} footer={footer} full>
      <div className="flex min-h-0 flex-1">
        <div className="w-32 shrink-0 overflow-y-auto bg-cream/70">
          {FILTER_TABS.map(t => {
            const count = t.id === 'category' ? draft.c.length : t.id === 'price' ? Number(Boolean(draft.price)) : Number(draft.eco);
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex w-full items-center justify-between border-l-4 px-3 py-4 text-left text-sm ${tab === t.id ? 'border-gold-500 bg-white font-bold' : 'border-transparent text-ink/70'}`}
              >
                {t.label}
                {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-xs font-bold text-gold-400">{count}</span>}
              </button>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-2">
          <FilterGroups filters={draft} setFilters={setDraft} categories={categories} only={tab} />
        </div>
      </div>
    </Sheet>
  );
}

export default function ShopPage({ products, categories, search, settings, onAddToCart }) {
  const filters = readFilters(search);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [sheet, setSheet] = useState(null); // null | 'sort' | 'filter'

  useEffect(() => setLimit(PAGE_SIZE), [search]);

  const usedCategories = useMemo(() => categories.filter(c => products.some(p => p.category === c.id)), [categories, products]);
  const visible = useMemo(() => applyFilters(products, filters), [products, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const single = filters.c.length === 1 ? categories.find(c => c.id === filters.c[0]) : null;
  const title = filters.q ? `Results for “${filters.q}”` : single ? single.name : 'All gifts';
  const sortLabel = SORTS.find(s => s.id === filters.sort)?.label || SORTS[0].label;
  const filterCount = activeCount(filters);

  const chip = active =>
    `inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-xs font-semibold transition ${
      active ? 'border-ink bg-ink text-gold-400' : 'border-ink/15 bg-white text-ink/70 hover:border-ink/40'
    }`;

  // Removable chips for each active filter.
  const activeChips = [
    ...(filters.q ? [{ label: `“${filters.q}”`, clear: { q: '' } }] : []),
    ...filters.c.map(id => ({ label: categories.find(c => c.id === id)?.name || id, clear: { c: filters.c.filter(c => c !== id) } })),
    ...(filters.price ? [{ label: PRICES.find(p => p.id === filters.price)?.label, clear: { price: '' } }] : []),
    ...(filters.eco ? [{ label: 'Eco-friendly', clear: { eco: false } }] : []),
  ];

  return (
    <div className="bg-[#f6f4ef] pb-12">
      {/* Phones: sticky Sort | Filter bar with quick category chips */}
      <div className="sticky top-[var(--header-h,140px)] z-30 border-b border-ink/10 bg-white shadow-sm lg:hidden">
        <div className="flex divide-x divide-ink/10 border-b border-ink/10">
          <button onClick={() => setSheet('sort')} className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold">
            <ArrowDownUp size={16} />
            <span className="flex flex-col items-start leading-tight">
              Sort
              {filters.sort && <span className="text-xs font-medium text-gold-800">{sortLabel}</span>}
            </span>
          </button>
          <button onClick={() => setSheet('filter')} className="flex flex-1 items-center justify-center gap-2 py-3 text-sm font-semibold">
            <SlidersHorizontal size={16} />
            Filter
            {filterCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-gold-500 px-1 text-xs font-bold">{filterCount}</span>}
          </button>
        </div>
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2.5">
          <button className={chip(!filters.c.length)} onClick={() => writeFilters({ ...filters, c: [] })}>All</button>
          {usedCategories.map(c => (
            <button key={c.id} className={chip(filters.c.length === 1 && filters.c[0] === c.id)} onClick={() => writeFilters({ ...filters, c: [c.id] })}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-6 px-0 pt-0 sm:px-6 lg:px-8 lg:pt-8">
        <Sidebar filters={filters} categories={usedCategories} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-end justify-between gap-3 bg-white px-4 py-4 sm:rounded-2xl sm:border sm:border-ink/10 sm:px-5 lg:mb-5">
            <div>
              <nav className="text-xs text-ink/60">
                <a href="/" onClick={linkHandler('/')} className="inline-block py-2 hover:text-ink">Home</a> / <span>Shop</span>
              </nav>
              <h1 className="mt-1 text-xl font-extrabold sm:text-2xl">{title}</h1>
              <p className="text-xs text-ink/60">Prices are per piece. Order more and every piece costs less.</p>
            </div>
            <label className="hidden items-center gap-2 text-xs text-ink/60 lg:flex">
              Sort by
              <select
                value={filters.sort}
                onChange={e => writeFilters({ ...filters, sort: e.target.value })}
                className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-xs font-semibold text-ink focus:border-gold-500 focus:outline-none"
              >
                {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
            {activeChips.length > 0 && (
              <div className="flex w-full flex-wrap gap-2">
                {activeChips.map(c => (
                  <button key={c.label} onClick={() => writeFilters({ ...filters, ...c.clear })} className="flex items-center gap-1 rounded-full bg-cream px-3 py-1 text-xs font-semibold hover:bg-gold-100">
                    {c.label} <X size={12} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {visible.length === 0 ? (
            <div className="mx-4 mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/20 bg-white py-16 text-center sm:mx-0">
              <SearchX className="text-ink/30" size={32} />
              <p className="font-semibold">No gifts match that</p>
              <p className="max-w-sm px-4 text-sm text-ink/60">Try another word or fewer filters, or tell us what you need on WhatsApp and we'll put together a custom combo for you.</p>
              <button className="btn-dark mt-2" onClick={() => navigate('/shop', { replace: true, keepScroll: true })}>Show all gifts</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-px bg-ink/10 sm:gap-5 sm:bg-transparent md:grid-cols-3 xl:grid-cols-4">
                {visible.slice(0, limit).map(product => (
                  <ProductCard key={product.id} product={product} settings={settings} onAddToCart={onAddToCart} flat />
                ))}
              </div>
              {visible.length > limit && (
                <div className="mt-8 flex justify-center">
                  <button className="btn-outline px-8" onClick={() => setLimit(l => l + PAGE_SIZE)}>
                    Show more gifts <ChevronDown size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {sheet === 'sort' && <SortSheet filters={filters} onClose={() => setSheet(null)} />}
      {sheet === 'filter' && <FilterSheet filters={filters} categories={usedCategories} products={products} onClose={() => setSheet(null)} />}
    </div>
  );
}
