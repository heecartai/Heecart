import React, { useEffect, useState } from 'react';
import { replaceSettings } from './utils';

const FIELDS = [
  { key: 'whatsapp', label: 'WhatsApp number (with country code, digits only)', placeholder: '919087778321', help: 'All orders are sent to this number.' },
  { key: 'phone_display', label: 'Phone number as shown on the site', placeholder: '90877 78321' },
  { key: 'email', label: 'Email', placeholder: 'heecartorders@gmail.com' },
  { key: 'address', label: 'Address', textarea: true },
  { key: 'instagram', label: 'Instagram username', placeholder: 'heecart_com' },
  { key: 'announcement', label: 'Top bar messages (separate messages with ·)', textarea: true },
  { key: 'trust_orders', label: 'Orders delivered (shown in the hero)', placeholder: '60,000+' },
  { key: 'trust_since', label: 'In business since (year)', placeholder: '2018' },
];

export default function SettingsTab({ data, run, busy }) {
  const [form, setForm] = useState(data.settings);
  useEffect(() => setForm(data.settings), [data.settings]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const submit = e => {
    e.preventDefault();
    const whatsapp = String(form.whatsapp).replace(/\D/g, '');
    if (whatsapp.length < 11) return alert('Enter the WhatsApp number with country code, e.g. 919087778321');
    run(replaceSettings({ ...form, whatsapp, free_shipping_min: Number(form.free_shipping_min) || 0 }), 'Updated store settings');
  };

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4">
      <h1 className="text-xl font-extrabold">Store settings</h1>

      <fieldset className="space-y-3 rounded-2xl border border-gold-300 bg-gold-50 p-5">
        <legend className="px-1 text-sm font-bold">Free-shipping offer</legend>
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <input type="checkbox" className="h-4 w-4 accent-[#f5b301]" checked={Boolean(form.free_shipping_enabled)} onChange={e => set('free_shipping_enabled', e.target.checked)} />
          Show the free-shipping offer and countdown on the website
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="fs-min">Free shipping on orders above ₹ (0 = every order)</label>
            <input id="fs-min" type="number" min="0" className="input" value={form.free_shipping_min ?? ''} onChange={e => set('free_shipping_min', e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="fs-end">Offer ends (leave empty for a daily offer)</label>
            <input id="fs-end" type="datetime-local" className="input" value={form.offer_ends_at || ''} onChange={e => set('offer_ends_at', e.target.value)} />
          </div>
        </div>
        <p className="text-xs text-ink/60">With no end date, the countdown restarts every midnight ("today's offer"). Remember to honour free shipping for orders that qualify.</p>
      </fieldset>

      {FIELDS.map(({ key, label, placeholder, help, textarea }) => (
        <div key={key}>
          <label className="label" htmlFor={key}>{label}</label>
          {textarea ? (
            <textarea id={key} rows={2} className="input" value={form[key] || ''} onChange={e => set(key, e.target.value)} />
          ) : (
            <input id={key} className="input" placeholder={placeholder} value={form[key] || ''} onChange={e => set(key, e.target.value)} />
          )}
          {help && <p className="mt-1 text-xs text-ink/60">{help}</p>}
        </div>
      ))}
      <button className="btn-dark" disabled={busy}>Save settings</button>
    </form>
  );
}
