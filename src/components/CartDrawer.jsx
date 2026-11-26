import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Lock, Minus, Plus, ShoppingCart, Tag, Trash2, Truck, X } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { linkHandler, navigate } from '../lib/router';
import { findCoupon } from '../lib/store';
import { freeShippingOffer, pad, useCountdown } from '../lib/offer';
import { cartTotals, formatINR, minOrderQty, unitPrice } from '../lib/pricing';
import { buildOrderMessage, newOrderId, openWhatsApp } from '../lib/whatsapp';

const CUSTOMER_KEY = 'heecart_customer';

const STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const blankCustomer = { name: '', phone: '', email: '', company: '', gstin: '', address: '', city: '', state: 'Tamil Nadu', pincode: '' };

function readCustomer() {
  try { return { ...blankCustomer, ...JSON.parse(localStorage.getItem(CUSTOMER_KEY)) }; } catch (e) { return blankCustomer; }
}

export default function CartDrawer({ view, onViewChange, items, settings, onUpdate, onRemove, onClear }) {
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponState, setCouponState] = useState('');
  const [customer, setCustomer] = useState(readCustomer);
  const [notes, setNotes] = useState('');
  const [placed, setPlaced] = useState(null); // { orderId, message } after sending

  const isOpen = Boolean(view);
  const close = () => onViewChange(null);

  useEffect(() => {
    try { localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer)); } catch (e) {}
  }, [customer]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = e => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const { subtotal, bulkSavings, discount, total } = cartTotals(items, coupon);
  const offer = freeShippingOffer(settings);
  const shippingFree = Boolean(offer && total >= offer.min);

  const applyCoupon = e => {
    e.preventDefault();
    const found = findCoupon(couponCode);
    setCoupon(found);
    setCouponState(found ? 'applied' : 'invalid');
  };

  const field = key => ({
    value: customer[key],
    onChange: e => setCustomer(c => ({ ...c, [key]: e.target.value })),
  });

  const placeOrder = e => {
    e.preventDefault();
    const orderId = newOrderId();
    const message = buildOrderMessage({
      orderId,
      items,
      coupon: discount ? coupon : null,
      shippingFree,
      customer: { ...customer, notes: notes.trim() },
    });
    openWhatsApp(settings.whatsapp, message);
    setPlaced({ orderId, message });
    setNotes('');
    setCoupon(null);
    setCouponCode('');
    setCouponState('');
    onClear();
    onViewChange('done');
  };

  if (!isOpen) return null;

  const title = { cart: 'Your cart', checkout: 'Delivery details', done: 'Order sent' }[view];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/60" onClick={close} />
      <div className="animate-fade-in relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-ink/10 px-5 py-4">
          {view === 'checkout' && (
            <button onClick={() => onViewChange('cart')} className="grid h-11 w-11 place-items-center rounded-full hover:bg-cream" aria-label="Back to cart"><ArrowLeft size={18} /></button>
          )}
          <h2 className="flex-1 text-lg font-extrabold">{title}</h2>
          <button onClick={close} className="grid h-11 w-11 place-items-center rounded-full hover:bg-cream" aria-label="Close"><X size={18} /></button>
        </div>

        {view === 'done' && placed ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <CheckCircle2 size={56} className="text-green-600" />
            <p className="text-xl font-extrabold">Thank you! Your order is on its way to us.</p>
            <p className="rounded-lg bg-cream px-3 py-1.5 font-mono text-sm font-bold">Order ID: {placed.orderId}</p>
            <p className="text-sm text-ink/60">
              Just press <strong>Send</strong> in WhatsApp. Our team will confirm your order and share the payment QR so you can pay by GPay / UPI.
            </p>
            <button onClick={() => openWhatsApp(settings.whatsapp, placed.message)} className="btn-whatsapp mt-2">
              <WhatsAppIcon size={18} /> WhatsApp didn't open? Tap here
            </button>
            <button onClick={close} className="min-h-11 text-sm font-semibold text-ink/60 underline">Continue shopping</button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <ShoppingCart size={44} className="text-gold-500" />
            <p className="text-lg font-bold">Your cart is empty</p>
            <p className="text-sm text-ink/60">Our most-loved gift sets are waiting for you.</p>
            <button onClick={() => { close(); navigate('/shop'); }} className="btn-dark mt-2">Start shopping</button>
          </div>
        ) : view === 'checkout' ? (
          <form onSubmit={placeOrder} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              <p className="text-xs text-ink/60">Where should we deliver? We'll send your order to our WhatsApp, and you pay only after we confirm.</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Full name *" className="col-span-2"><input className="input" autoComplete="name" required {...field('name')} /></Field>
                <Field label="Mobile number *">
                  <input className="input" type="tel" inputMode="numeric" autoComplete="tel" pattern="[0-9+ ]{10,15}" title="10-digit mobile number" required {...field('phone')} />
                </Field>
                <Field label="Email"><input className="input" type="email" autoComplete="email" {...field('email')} /></Field>
                <Field label="Company"><input className="input" autoComplete="organization" {...field('company')} /></Field>
                <Field label="GSTIN (for GST invoice)"><input className="input uppercase" maxLength={15} {...field('gstin')} /></Field>
                <Field label="Address (house / street / area) *" className="col-span-2">
                  <textarea className="input" rows={2} autoComplete="street-address" required {...field('address')} />
                </Field>
                <Field label="City *"><input className="input" autoComplete="address-level2" required {...field('city')} /></Field>
                <Field label="Pincode *">
                  <input className="input" inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{6}" title="6-digit pincode" maxLength={6} required {...field('pincode')} />
                </Field>
                <Field label="State *" className="col-span-2">
                  <select className="input" required {...field('state')}>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Notes (delivery date, colours, logo details…)" className="col-span-2">
                  <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
                </Field>
              </div>
            </div>
            <div className="border-t border-ink/10 p-5">
              <Totals subtotal={subtotal} bulkSavings={bulkSavings} discount={discount} coupon={coupon} total={total} shippingFree={shippingFree} />
              <button className="btn-whatsapp mt-4 w-full py-3.5 text-base">
                <WhatsAppIcon size={20} /> Place order on WhatsApp
              </button>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-ink/60"><Lock size={12} /> No payment now. Pay by GPay / UPI after we confirm.</p>
            </div>
          </form>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {offer && offer.min > 0 && (
                <div className="rounded-2xl bg-cream p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold">
                    <Truck size={15} className="text-gold-700" />
                    {shippingFree ? 'Yay! Your order ships FREE.' : <>Add <strong>{formatINR(offer.min - total)}</strong> more for FREE shipping</>}
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-green-500 transition-all" style={{ width: `${Math.min(100, (total / offer.min) * 100)}%` }} />
                  </div>
                </div>
              )}
              {offer && offer.min === 0 && <FreeShippingTimer end={offer.end} />}

              {items.map(item => {
                const price = unitPrice(item.product, item.qty);
                const minQty = minOrderQty(item.product);
                const href = `/p/${item.product.id}`;
                return (
                  <div key={item.product.id + item.printText} className="flex gap-3 rounded-2xl border border-ink/10 p-3">
                    <a href={href} onClick={e => { linkHandler(href)(e); close(); }} className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream">
                      <img src={item.product.image} alt="" className="h-full w-full object-cover" />
                    </a>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold leading-snug">{item.product.name}</p>
                        <button onClick={() => onRemove(item)} className="-m-3 grid h-11 w-11 shrink-0 place-items-center text-ink/60 hover:text-red-600" aria-label={`Remove ${item.product.name}`}><Trash2 size={15} /></button>
                      </div>
                      {item.printText && <p className="mt-0.5 truncate text-xs text-ink/60">Print: {item.printText}</p>}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-ink/15">
                          <button onClick={() => onUpdate(item, { qty: Math.max(minQty, item.qty - 1) })} className="grid h-11 w-11 place-items-center text-ink/60" aria-label="Decrease quantity"><Minus size={13} /></button>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={item.qty}
                            min={minQty}
                            onChange={e => onUpdate(item, { qty: Math.max(minQty, Math.floor(Number(e.target.value)) || minQty) })}
                            className="h-11 w-14 border-x border-ink/15 text-center text-sm font-bold"
                            aria-label="Quantity"
                          />
                          <button onClick={() => onUpdate(item, { qty: item.qty + 1 })} className="grid h-11 w-11 place-items-center text-ink/60" aria-label="Increase quantity"><Plus size={13} /></button>
                        </div>
                        {price != null && (
                          <div className="text-right">
                            <p className="text-sm font-bold">{formatINR(price * item.qty)}</p>
                            <p className="text-xs text-ink/60">{formatINR(price)}/pc</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <form onSubmit={applyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/60" />
                  <input
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponState(''); }}
                    placeholder="Have a coupon code?"
                    className="input pl-9 uppercase"
                  />
                </div>
                <button className="btn-outline px-4 py-2.5" disabled={!couponCode.trim()}>Apply</button>
              </form>
              {couponState === 'invalid' && <p className="-mt-2 text-xs text-red-600">That coupon isn't valid right now.</p>}
              {couponState === 'applied' && coupon && (
                <p className="-mt-2 text-xs font-semibold text-green-700">
                  {coupon.code} applied{coupon.description ? `: ${coupon.description}` : ''}
                  {!discount && coupon.min_amount ? ` (needs a ${formatINR(coupon.min_amount)}+ order)` : ''}
                </p>
              )}
            </div>

            <div className="border-t border-ink/10 p-5">
              <Totals subtotal={subtotal} bulkSavings={bulkSavings} discount={discount} coupon={coupon} total={total} shippingFree={shippingFree} />
              <button onClick={() => onViewChange('checkout')} className="btn-gold mt-4 w-full py-3.5 text-base">
                Checkout · {formatINR(total)}
              </button>
              <button onClick={close} className="mt-1 min-h-11 w-full text-center text-xs font-semibold text-ink/60 hover:text-ink">Continue shopping</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Field({ label, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function FreeShippingTimer({ end }) {
  const left = useCountdown(end);
  if (!left) return null;
  const time = `${left.days ? `${left.days}d ` : ''}${pad(left.hours)}:${pad(left.minutes)}:${pad(left.seconds)}`;
  return (
    <p className="flex items-center gap-2 rounded-2xl bg-green-50 p-3 text-xs font-semibold text-green-800">
      <Truck size={15} className="shrink-0" />
      <span>Your order ships FREE if you place it in the next <strong className="font-mono">{time}</strong></span>
    </p>
  );
}

function Totals({ subtotal, bulkSavings, discount, coupon, total, shippingFree }) {
  return (
    <div className="space-y-1 text-sm">
      <div className="flex justify-between text-ink/60"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
      {bulkSavings > 0 && <div className="flex justify-between text-green-700"><span>Bulk savings included</span><span>{formatINR(bulkSavings)}</span></div>}
      {discount > 0 && <div className="flex justify-between text-green-700"><span>Coupon {coupon.code}</span><span>-{formatINR(discount)}</span></div>}
      <div className="flex justify-between text-ink/60"><span>Shipping</span><span className={shippingFree ? 'font-bold text-green-700' : ''}>{shippingFree ? 'FREE' : 'Confirmed on WhatsApp'}</span></div>
      <div className="flex justify-between pt-1 text-lg font-extrabold"><span>Total</span><span>{formatINR(total)} <span className="text-xs font-medium text-ink/60">+ GST</span></span></div>
    </div>
  );
}
