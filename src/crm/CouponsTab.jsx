import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { removeCoupon, upsertCoupon } from './utils';
import { formatINR } from '../lib/pricing';

const blank = { code: '', description: '', type: 'percent', value: '', min_amount: '', active: true };

export default function CouponsTab({ data, run, busy }) {
  const { coupons } = data;
  const [form, setForm] = useState(blank);
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const add = e => {
    e.preventDefault();
    const coupon = {
      ...form,
      code: form.code.trim().toUpperCase(),
      description: form.description.trim(),
      value: Number(form.value),
      min_amount: Number(form.min_amount) || 0,
    };
    if (!coupon.code || !(coupon.value > 0)) return;
    if (coupon.type === 'percent' && coupon.value > 90) return alert('A percentage discount can be at most 90%.');
    run(upsertCoupon(coupon), `Saved coupon ${coupon.code}`).then(ok => ok && setForm(blank));
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-extrabold">Coupons & festival offers</h1>
      <p className="mt-1 text-sm text-ink/60">
        Customers type the code in their cart. The discount appears in the WhatsApp order they send you.
        Turn a coupon off when the offer ends.
      </p>

      <ul className="mt-5 space-y-2">
        {coupons.map(c => (
          <li key={c.code} className={`flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4 ${c.active ? 'border-ink/10' : 'border-dashed border-ink/20 opacity-70'}`}>
            <span className="rounded-lg bg-ink px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-gold-400">{c.code}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {c.type === 'percent' ? `${c.value}% off` : `${formatINR(c.value)} off`}
                {c.min_amount > 0 && <span className="font-normal text-ink/60"> on orders above {formatINR(c.min_amount)}</span>}
              </p>
              {c.description && <p className="truncate text-xs text-ink/60">{c.description}</p>}
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold">
              <input type="checkbox" checked={c.active} disabled={busy} onChange={() => run(upsertCoupon({ ...c, active: !c.active }), `Turned coupon ${c.code} ${c.active ? 'off' : 'on'}`)} className="h-4 w-4 accent-[#f5b301]" />
              Active
            </label>
            <button onClick={() => window.confirm(`Delete coupon ${c.code}?`) && run(removeCoupon(c.code), `Deleted coupon ${c.code}`)} className="grid h-9 w-9 place-items-center rounded-lg text-ink/60 hover:bg-cream hover:text-red-600" aria-label={`Delete ${c.code}`}>
              <Trash2 size={16} />
            </button>
          </li>
        ))}
        {coupons.length === 0 && <li className="rounded-2xl border border-dashed border-ink/20 py-8 text-center text-sm text-ink/60">No coupons yet.</li>}
      </ul>

      <form onSubmit={add} className="mt-6 grid gap-3 rounded-2xl border border-ink/10 bg-white p-5 sm:grid-cols-2">
        <p className="font-bold sm:col-span-2">New coupon</p>
        <div>
          <label className="label" htmlFor="code">Code</label>
          <input id="code" className="input font-mono uppercase" placeholder="DIWALI10" value={form.code} onChange={e => set('code', e.target.value.replace(/\s/g, ''))} required maxLength={20} />
        </div>
        <div>
          <label className="label" htmlFor="desc">Short description</label>
          <input id="desc" className="input" placeholder="Diwali offer" value={form.description} onChange={e => set('description', e.target.value)} maxLength={60} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label" htmlFor="type">Discount</label>
            <select id="type" className="input" value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="percent">% off</option>
              <option value="flat">₹ off</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="value">Amount</label>
            <input id="value" type="number" min="1" className="input" value={form.value} onChange={e => set('value', e.target.value)} required />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="min">Minimum order ₹ (optional)</label>
          <input id="min" type="number" min="0" className="input" value={form.min_amount} onChange={e => set('min_amount', e.target.value)} />
        </div>
        <button className="btn-gold sm:col-span-2" disabled={busy}><Plus size={16} /> Save coupon</button>
      </form>
    </div>
  );
}
