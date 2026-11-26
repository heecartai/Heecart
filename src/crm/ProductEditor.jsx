import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Plus, Star, Trash2, X } from 'lucide-react';
import { TIER_SLABS } from '../data/catalog';
import { preparePhoto } from '../lib/github';
import { imgSrc, rememberPreview, slugify, uniqueId } from './utils';

const SET_TYPES = ['2 in 1', '3 in 1', '4 in 1', '5 in 1', '6 in 1', '7 in 1', '10 in 1', 'Single'];

const blankTiers = () => TIER_SLABS.map(slab => ({ ...slab, price: '' }));

function toForm(product, products) {
  const isNew = !product.id;
  return {
    id: product.id || '',
    name: product.name || '',
    set_type: product.set_type || '3 in 1',
    category: product.category || '',
    badge: product.badge || '',
    description: product.description || '',
    includes: (product.includes || []).join('\n'),
    eco: (product.tags || []).includes('eco'),
    featured: Boolean(product.featured),
    active: isNew ? true : product.active !== false,
    sort_order: product.sort_order ?? Math.max(0, ...products.map(p => p.sort_order || 0)) + 1,
    image: product.image || '',
    gallery: product.gallery || [],
    tiers: product.tiers?.length ? product.tiers.map(t => ({ ...t, price: t.price ?? '' })) : blankTiers(),
    otherTags: (product.tags || []).filter(t => t !== 'eco'),
  };
}

export default function ProductEditor({ product, products, categories, busy, onClose, onSave }) {
  const isNew = !product.id;
  const [form, setForm] = useState(() => ({ ...toForm(product, products), category: product.category || categories[0]?.id || '' }));
  const [idTouched, setIdTouched] = useState(!isNew);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newPhotos, setNewPhotos] = useState([]); // uploaded here, committed with the product on save
  const mainInput = useRef(null);
  const galleryInput = useRef(null);

  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const setName = name => setForm(f => ({ ...f, name, id: idTouched ? f.id : slugify(name) }));

  const setTier = (index, key, value) =>
    setForm(f => ({ ...f, tiers: f.tiers.map((t, i) => (i === index ? { ...t, [key]: value } : t)) }));

  const upload = async (files, target) => {
    if (!files?.length) return;
    setUploading(true);
    setError('');
    try {
      const urls = [];
      for (const file of files) {
        const photo = await preparePhoto(file);
        rememberPreview(photo.url, photo.dataUrl);
        setNewPhotos(list => [...list, photo]);
        urls.push(photo.url);
      }
      if (target === 'main') set('image', urls[0]);
      else setForm(f => ({ ...f, gallery: [...f.gallery, ...urls] }));
    } catch (err) {
      setError(`Photo upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const makeMain = index =>
    setForm(f => {
      const gallery = [...f.gallery];
      const [picked] = gallery.splice(index, 1);
      if (f.image) gallery.unshift(f.image);
      return { ...f, image: picked, gallery };
    });

  const submit = async e => {
    e.preventDefault();
    setError('');
    const tiers = form.tiers
      .filter(t => t.price !== '' && t.price != null)
      .map(t => ({ label: String(t.label).trim() || `${t.min}+ Pcs`, min: Math.max(1, Number(t.min) || 1), price: Number(t.price) }))
      .sort((a, b) => a.min - b.min);

    if (!form.name.trim()) return setError('Please enter a product name.');
    if (!form.image) return setError('Please add a main photo.');
    if (!tiers.length) return setError('Please enter at least one price.');
    if (tiers.some(t => !(t.price > 0))) return setError('Prices must be numbers above 0.');

    const id = isNew ? uniqueId(form.id || form.name, products) : product.id;
    const saved = {
      ...product,
      id,
      name: form.name.trim(),
      set_type: form.set_type.trim(),
      category: form.category,
      badge: form.badge.trim(),
      description: form.description.trim(),
      includes: form.includes.split('\n').map(s => s.trim()).filter(Boolean),
      tags: [...form.otherTags, ...(form.eco ? ['eco'] : [])],
      featured: form.featured,
      active: form.active,
      sort_order: Number(form.sort_order) || 0,
      image: form.image,
      gallery: form.gallery,
      tiers,
    };
    const usedPhotos = newPhotos.filter(photo => saved.image === photo.url || saved.gallery.includes(photo.url));
    setSaving(true);
    await onSave(saved, usedPhotos.map(({ path, base64 }) => ({ path, base64 })), isNew);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-ink/60 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="animate-fade-in flex max-h-full w-full max-w-3xl flex-col bg-white sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h2 className="text-lg font-extrabold">{isNew ? 'Add product' : 'Edit product'}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-cream" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {/* Photos */}
          <section>
            <p className="label">Photos</p>
            <div className="flex flex-wrap gap-3">
              <div className="relative h-32 w-32 overflow-hidden rounded-2xl border-2 border-gold-500 bg-cream">
                {form.image ? <img src={imgSrc(form.image)} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-ink/60">No photo</div>}
                <span className="absolute left-1.5 top-1.5 rounded bg-gold-500 px-1.5 py-0.5 text-xs font-bold">MAIN</span>
                <button type="button" onClick={() => mainInput.current.click()} className="absolute inset-x-1.5 bottom-1.5 rounded-lg bg-ink/80 py-1 text-xs font-semibold text-white">
                  {form.image ? 'Replace' : 'Upload'}
                </button>
              </div>
              {form.gallery.map((src, i) => (
                <div key={src + i} className="relative h-32 w-32 overflow-hidden rounded-2xl border border-ink/10 bg-cream">
                  <img src={imgSrc(src)} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-x-1.5 bottom-1.5 flex gap-1">
                    <button type="button" title="Make main photo" onClick={() => makeMain(i)} className="grid flex-1 place-items-center rounded-lg bg-ink/80 py-1 text-white"><Star size={13} /></button>
                    <button type="button" title="Remove photo" onClick={() => set('gallery', form.gallery.filter((_, j) => j !== i))} className="grid flex-1 place-items-center rounded-lg bg-ink/80 py-1 text-white"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => galleryInput.current.click()} className="grid h-32 w-32 place-items-center rounded-2xl border-2 border-dashed border-ink/20 text-ink/60 hover:border-gold-500 hover:text-ink">
                <span className="flex flex-col items-center gap-1 text-xs font-semibold">
                  {uploading ? <Loader2 size={20} className="animate-spin" /> : <ImagePlus size={20} />}
                  {uploading ? 'Uploading…' : 'Add more photos'}
                </span>
              </button>
            </div>
            <input ref={mainInput} type="file" accept="image/*" hidden onChange={e => { upload([...e.target.files], 'main'); e.target.value = ''; }} />
            <input ref={galleryInput} type="file" accept="image/*" multiple hidden onChange={e => { upload([...e.target.files], 'gallery'); e.target.value = ''; }} />
            <details className="mt-2 text-xs text-ink/60">
              <summary className="cursor-pointer">Or paste a photo link</summary>
              <input className="input mt-2" placeholder="https://…" value={form.image} onChange={e => set('image', e.target.value.trim())} />
            </details>
          </section>

          {/* Basics */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="name">Product name *</label>
              <input id="name" className="input" value={form.name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="category">Category</label>
              <select id="category" className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="set_type">Set type</label>
              <input id="set_type" className="input" list="set-types" value={form.set_type} onChange={e => set('set_type', e.target.value)} />
              <datalist id="set-types">{SET_TYPES.map(s => <option key={s} value={s} />)}</datalist>
            </div>
            <div>
              <label className="label" htmlFor="badge">Badge (optional)</label>
              <input id="badge" className="input" placeholder="e.g. New, Diwali special" value={form.badge} onChange={e => set('badge', e.target.value)} maxLength={20} />
            </div>
            <div>
              <label className="label" htmlFor="slug">Link name</label>
              <input
                id="slug"
                className="input disabled:bg-ink/5 disabled:text-ink/60"
                value={form.id}
                disabled={!isNew}
                onChange={e => { setIdTouched(true); set('id', slugify(e.target.value)); }}
              />
              <p className="mt-1 text-xs text-ink/60">heecart…/p/{form.id || 'product-name'}{!isNew && ' (fixed so shared links keep working)'}</p>
            </div>
          </section>

          {/* Prices */}
          <section>
            <p className="label">Price per piece</p>
            <div className="overflow-hidden rounded-2xl border border-ink/10">
              <div className="grid grid-cols-[1fr_90px_110px_40px] gap-2 bg-gold-500 px-3 py-2 text-[11px] font-bold uppercase">
                <span>Label</span><span>From qty</span><span>Price ₹</span><span />
              </div>
              {form.tiers.map((tier, i) => (
                <div key={i} className="grid grid-cols-[1fr_90px_110px_40px] items-center gap-2 border-t border-ink/10 px-3 py-2">
                  <input className="input py-2" value={tier.label} onChange={e => setTier(i, 'label', e.target.value)} aria-label="Slab label" />
                  <input className="input py-2" type="number" min="1" value={tier.min} onChange={e => setTier(i, 'min', e.target.value)} aria-label="From quantity" />
                  <input className="input py-2" type="number" min="0" placeholder="—" value={tier.price} onChange={e => setTier(i, 'price', e.target.value)} aria-label="Price" />
                  <button type="button" onClick={() => set('tiers', form.tiers.filter((_, j) => j !== i))} className="grid h-9 w-9 place-items-center rounded-lg text-ink/60 hover:text-red-600" aria-label="Remove slab"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              <button type="button" onClick={() => set('tiers', [...form.tiers, { label: '', min: '', price: '' }])} className="flex items-center gap-1 font-semibold text-gold-800"><Plus size={14} /> Add slab</button>
              <span className="text-ink/60">Leave a price empty to skip that slab (e.g. no single-piece orders).</span>
            </div>
          </section>

          {/* Details */}
          <section className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="includes">What's in the box (one item per line)</label>
              <textarea id="includes" rows={5} className="input" value={form.includes} onChange={e => set('includes', e.target.value)} placeholder={'Diary\nSteel bottle\nMetal pen'} />
            </div>
            <div>
              <label className="label" htmlFor="description">Description (optional)</label>
              <textarea id="description" rows={5} className="input" value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
          </section>

          <section className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-cream p-4 text-sm">
            <Check label="Show on website" checked={form.active} onChange={v => set('active', v)} />
            <Check label="Featured" checked={form.featured} onChange={v => set('featured', v)} />
            <Check label="Eco (bamboo / cork)" checked={form.eco} onChange={v => set('eco', v)} />
            <label className="flex items-center gap-2">
              Position
              <input type="number" className="input w-20 py-1.5" value={form.sort_order} onChange={e => set('sort_order', e.target.value)} />
            </label>
          </section>
        </div>

        <div className="flex items-center gap-3 border-t border-ink/10 px-5 py-4">
          {error && <p className="mr-auto text-xs font-semibold text-red-600">{error}</p>}
          <button type="button" onClick={onClose} className="btn-outline ml-auto">Cancel</button>
          <button className="btn-dark" disabled={saving || uploading || busy}>{saving ? 'Saving…' : isNew ? 'Add product' : 'Save changes'}</button>
        </div>
      </form>
    </div>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 font-medium">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="h-4 w-4 accent-[#f5b301]" />
      {label}
    </label>
  );
}
