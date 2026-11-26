import React, { useMemo, useState } from 'react';
import { Copy, Eye, EyeOff, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import ProductEditor from './ProductEditor';
import { formatINR, lowestPrice, startingPrice } from '../lib/pricing';
import { imgSrc, removeProduct, uniqueId, upsertProduct } from './utils';

export default function ProductsTab({ data, run, busy }) {
  const { products, categories } = data;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [editing, setEditing] = useState(null); // product object, or {} for a new one

  const categoryName = id => categories.find(c => c.id === id)?.name || id || 'No category';

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(p =>
      (category === 'all' || p.category === category) &&
      (!q || `${p.name} ${p.set_type} ${p.id}`.toLowerCase().includes(q)));
  }, [products, query, category]);

  const toggle = (product, field) => {
    const message =
      field === 'active' ? `${product.active ? 'Hid' : 'Showed'} "${product.name}"` :
      `${product.featured ? 'Unfeatured' : 'Featured'} "${product.name}"`;
    run(upsertProduct({ ...product, [field]: !product[field] }), message);
  };

  const duplicate = product => {
    const copy = {
      ...product,
      id: uniqueId(`${product.id}-copy`, products),
      name: `${product.name} (copy)`,
      active: false,
      sort_order: Math.max(0, ...products.map(p => p.sort_order || 0)) + 1,
    };
    run(upsertProduct(copy), `Copied "${product.name}" (hidden until you turn it on)`);
  };

  const remove = product => {
    if (!window.confirm(`Delete "${product.name}" from the website? This can't be undone.\n\nTip: use the eye button to hide it instead.`)) return;
    run(removeProduct(product.id), `Deleted "${product.name}"`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-xl font-extrabold">Products <span className="text-sm font-medium text-ink/60">({products.length})</span></h1>
        <button onClick={() => setEditing({})} className="btn-gold" disabled={busy}><Plus size={16} /> Add product</button>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/60" />
          <input className="input pl-9" placeholder="Search products" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <select className="input sm:w-64" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <ul className="mt-4 space-y-2">
        {visible.map(product => (
          <li key={product.id} className={`flex items-center gap-3 rounded-2xl border bg-white p-3 ${product.active ? 'border-ink/10' : 'border-dashed border-ink/20 opacity-70'}`}>
            <img src={imgSrc(product.image)} alt="" className="h-16 w-16 shrink-0 rounded-xl bg-cream object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {product.name}
                {!product.active && <span className="ml-2 rounded bg-ink/10 px-1.5 py-0.5 text-[11px] font-bold uppercase text-ink/60">Hidden</span>}
              </p>
              <p className="truncate text-xs text-ink/60">{product.set_type} · {categoryName(product.category)}</p>
              <p className="text-xs font-semibold">
                {startingPrice(product) != null ? formatINR(startingPrice(product)) : '—'}
                {lowestPrice(product) < startingPrice(product) && <span className="font-normal text-ink/60"> → {formatINR(lowestPrice(product))} bulk</span>}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-1">
              <IconButton disabled={busy} title={product.active ? 'Hide from website' : 'Show on website'} onClick={() => toggle(product, 'active')}>
                {product.active ? <Eye size={16} /> : <EyeOff size={16} />}
              </IconButton>
              <IconButton disabled={busy} title={product.featured ? 'Remove from featured' : 'Mark as featured'} onClick={() => toggle(product, 'featured')}>
                <Star size={16} className={product.featured ? 'fill-gold-500 text-gold-500' : ''} />
              </IconButton>
              <IconButton disabled={busy} title="Edit" onClick={() => setEditing(product)}><Pencil size={16} /></IconButton>
              <IconButton disabled={busy} title="Duplicate" onClick={() => duplicate(product)} className="hidden sm:grid"><Copy size={16} /></IconButton>
              <IconButton disabled={busy} title="Delete" onClick={() => remove(product)} className="hover:text-red-600"><Trash2 size={16} /></IconButton>
            </div>
          </li>
        ))}
        {visible.length === 0 && <li className="py-12 text-center text-sm text-ink/60">No products match.</li>}
      </ul>

      {editing && (
        <ProductEditor
          product={editing}
          products={products}
          categories={categories}
          onClose={() => setEditing(null)}
          busy={busy}
          onSave={async (product, files, isNew) => {
            const ok = await run(upsertProduct(product), `${isNew ? 'Added' : 'Updated'} "${product.name}"`, files);
            if (ok) setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function IconButton({ title, onClick, children, disabled, className = '' }) {
  return (
    <button title={title} aria-label={title} onClick={onClick} disabled={disabled} className={`grid h-9 w-9 place-items-center rounded-lg text-ink/60 hover:bg-cream hover:text-ink disabled:opacity-40 ${className}`}>
      {children}
    </button>
  );
}
