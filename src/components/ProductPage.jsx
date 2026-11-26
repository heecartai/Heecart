import React, { useState } from 'react';
import {
  BadgeIndianRupee, Check, ChevronLeft, Gift, Leaf, Link2, Minus, Plus, Share2, ShoppingCart, Sparkles, TrendingDown, Truck, Zap,
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import ProductCard from './ProductCard';
import { linkHandler } from '../lib/router';
import { freeShippingOffer, pad, useCountdown } from '../lib/offer';
import { activeTierIndex, formatINR, minOrderQty, savingsPercent, sortedTiers, startingPrice, unitPrice } from '../lib/pricing';
import { productUrl, whatsappLink } from '../lib/whatsapp';

const NOTES = [
  { icon: Sparkles, text: 'Your logo or name printed' },
  { icon: Gift, text: 'Premium gift-box packing' },
  { icon: BadgeIndianRupee, text: 'Pay by GPay / UPI' },
  { icon: Truck, text: 'Delivered to your door' },
];

// "1 Pc" -> "1 piece", "5 – 10 Pcs" -> "5 – 10 pieces": friendlier wording for shoppers.
const friendlyLabel = label => label.replace(/\bPcs?\b/i, m => (m.toLowerCase() === 'pc' ? 'piece' : 'pieces'));

function ShippingNote({ settings, total }) {
  const offer = freeShippingOffer(settings);
  const left = useCountdown(offer?.end);
  if (!offer || !left) return <p className="text-xs text-ink/60">+ GST. Shipping is confirmed on WhatsApp.</p>;
  const time = `${left.days ? `${left.days}d ` : ''}${pad(left.hours)}:${pad(left.minutes)}:${pad(left.seconds)}`;
  return total >= offer.min ? (
    <p className="flex items-center gap-1.5 text-xs font-semibold text-green-700">
      <Truck size={14} /> FREE shipping if you order in the next {time}
    </p>
  ) : (
    <p className="flex items-center gap-1.5 text-xs font-semibold text-gold-800">
      <Truck size={14} /> Add {formatINR(offer.min - total)} more for FREE shipping. Ends in {time}
    </p>
  );
}

export default function ProductPage({ product, products, categories, settings, onAddToCart }) {
  const images = [product.image, ...(product.gallery || [])].filter(Boolean);
  const [activeImage, setActiveImage] = useState(0);
  const minQty = minOrderQty(product);
  const [qty, setQty] = useState(minQty);
  const [printText, setPrintText] = useState('');
  const [copied, setCopied] = useState(false);

  const tiers = sortedTiers(product);
  const quantity = Number(qty) || 0;
  const price = unitPrice(product, quantity);
  const regular = startingPrice(product);
  const activeTier = activeTierIndex(product, quantity);
  const nextTier = tiers[activeTier + 1];
  const total = price ? price * quantity : 0;
  const saved = regular && price ? (regular - price) * quantity : 0;
  const category = categories.find(c => c.id === product.category);
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const setQuantity = value => setQty(Math.max(minQty, Math.min(99999, Number.isFinite(value) ? Math.floor(value) : minQty)));
  const validQty = Math.max(minQty, quantity || minQty);

  const share = async () => {
    const url = productUrl(product.id);
    if (navigator.share) {
      try { await navigator.share({ title: product.name, url }); } catch (e) {}
      return;
    }
    await navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1 text-xs text-ink/60">
        <a href="/" onClick={linkHandler('/')} className="flex min-h-11 items-center gap-1 hover:text-ink">
          <ChevronLeft size={14} /> Home
        </a>
        {category && (
          <>
            <span>/</span>
            <a href={`/shop?c=${category.id}`} onClick={linkHandler(`/shop?c=${category.id}`)} className="flex min-h-11 items-center hover:text-ink">{category.name}</a>
          </>
        )}
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div className="lg:sticky lg:top-36 lg:self-start">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-ink/10 bg-cream">
            <img src={images[activeImage]} alt={product.name} className="h-full w-full object-cover" />
            <span className="absolute left-3 top-3 rounded-lg bg-ink px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-gold-400">{product.set_type} set</span>
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${i === activeImage ? 'border-gold-500' : 'border-transparent opacity-70'}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.badge && <span className="rounded-md bg-gold-500 px-2 py-0.5 text-[11px] font-bold uppercase">{product.badge}</span>}
            {product.tags?.includes('eco') && (
              <span className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-bold uppercase text-green-800">
                <Leaf size={12} /> Eco-friendly
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">{product.name}</h1>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold">{formatINR(price || regular)}</span>
            <span className="text-sm text-ink/60">per piece</span>
            {price && price < regular && <span className="text-sm text-ink/60 line-through">{formatINR(regular)}</span>}
          </p>
          {product.description && <p className="mt-4 text-sm leading-relaxed text-ink/70">{product.description}</p>}

          {/* Step 1: quantity */}
          <div className="mt-7">
            <h2 className="flex items-center gap-2 text-sm font-extrabold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-xs text-gold-400">1</span>
              How many do you need?
            </h2>
            <p className="mt-1 text-xs text-ink/60">Tap a quantity. The more you order, the less you pay per piece.</p>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Choose quantity">
              {tiers.map((tier, i) => {
                const selected = i === activeTier;
                const save = savingsPercent(product, tier.price);
                return (
                  <button
                    key={tier.min}
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setQuantity(tier.min)}
                    className={`relative rounded-2xl border-2 p-3 text-left transition ${
                      selected ? 'border-gold-500 bg-gold-50 shadow-md' : 'border-ink/10 hover:border-ink/30'
                    }`}
                  >
                    <span className={`absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full border-2 ${selected ? 'border-gold-500 bg-gold-500 text-ink' : 'border-ink/20'}`}>
                      {selected && <Check size={12} strokeWidth={3} />}
                    </span>
                    <span className="block pr-6 text-xs font-semibold text-ink/60">{friendlyLabel(tier.label)}</span>
                    <span className="mt-1 block text-lg font-extrabold">{formatINR(tier.price)}<span className="text-xs font-medium text-ink/60">/pc</span></span>
                    <span className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-xs font-bold ${save ? 'bg-green-100 text-green-800' : 'bg-ink/5 text-ink/60'}`}>
                      {save ? `SAVE ${save}%` : 'Regular price'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-ink/70">Exact quantity:</span>
              <div className="flex items-center rounded-xl border border-ink/15">
                <button onClick={() => setQuantity(validQty - 1)} className="grid h-11 w-11 place-items-center text-ink/60 hover:text-ink" aria-label="Decrease quantity"><Minus size={16} /></button>
                <input
                  type="number"
                  inputMode="numeric"
                  min={minQty}
                  value={qty}
                  onChange={e => setQty(e.target.value === '' ? '' : Number(e.target.value))}
                  onBlur={() => setQuantity(Number(qty))}
                  className="h-11 w-20 border-x border-ink/15 text-center text-sm font-bold"
                  aria-label="Quantity"
                />
                <button onClick={() => setQuantity(validQty + 1)} className="grid h-11 w-11 place-items-center text-ink/60 hover:text-ink" aria-label="Increase quantity"><Plus size={16} /></button>
              </div>
              <span className="text-xs text-ink/60">Need 20 or 250? Type any number.</span>
            </div>

            {nextTier && price && (
              <button onClick={() => setQuantity(nextTier.min)} className="mt-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-green-600/40 bg-green-50 px-3 py-2.5 text-left text-xs text-green-900 hover:bg-green-100">
                <TrendingDown size={16} className="shrink-0" />
                <span>
                  Add <strong>{nextTier.min - quantity} more</strong> and pay just <strong>{formatINR(nextTier.price)}/pc</strong>
                  {' '}(save {savingsPercent(product, nextTier.price)}%). <span className="underline">Switch to {nextTier.min} pcs</span>
                </span>
              </button>
            )}
          </div>

          {/* Step 2: personalise */}
          <div className="mt-7">
            <h2 className="flex items-center gap-2 text-sm font-extrabold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-xs text-gold-400">2</span>
              Personalise it <span className="font-medium text-ink/60">(optional)</span>
            </h2>
            <input
              className="input mt-3"
              value={printText}
              onChange={e => setPrintText(e.target.value)}
              placeholder="Company name or person's name to print"
              maxLength={80}
              aria-label="Name or company to print"
            />
            <p className="mt-1.5 text-xs text-ink/60">Want your logo? Send it to us on WhatsApp after you place your order.</p>
          </div>

          {/* Total + actions */}
          <div className="mt-7 rounded-3xl border border-ink/10 bg-cream/60 p-5">
            {price != null && quantity >= minQty ? (
              <>
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-xs text-ink/60">{formatINR(price)} × {quantity} pcs</p>
                    <p className="text-3xl font-extrabold">{formatINR(total)}</p>
                  </div>
                  {saved > 0 && (
                    <div className="text-right">
                      <p className="text-xs text-ink/60 line-through">{formatINR(regular * quantity)}</p>
                      <p className="rounded-lg bg-green-600 px-2 py-1 text-xs font-bold text-white">You save {formatINR(saved)}</p>
                    </div>
                  )}
                </div>
                <div className="mt-2"><ShippingNote settings={settings} total={total} /></div>
              </>
            ) : (
              <p className="text-sm text-ink/60">Minimum order is {minQty} pieces.</p>
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button onClick={() => onAddToCart(product, validQty, printText.trim())} className="btn-gold py-3.5 text-base">
                <ShoppingCart size={18} /> Add to cart
              </button>
              <button onClick={() => onAddToCart(product, validQty, printText.trim(), { checkout: true })} className="btn-dark py-3.5 text-base">
                <Zap size={18} className="text-gold-400" /> Buy now
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 text-xs">
              <a
                href={whatsappLink(settings.whatsapp, `Hi Heecart! I have a question about ${product.name}: ${productUrl(product.id)}`)}
                target="_blank"
                rel="noopener"
                className="flex min-h-11 items-center gap-1.5 font-semibold text-[#128c4a] hover:underline"
              >
                <WhatsAppIcon size={15} /> Questions? Ask us on WhatsApp
              </a>
              <button onClick={share} className="flex min-h-11 items-center gap-1.5 font-semibold text-ink/60 hover:text-ink" aria-label="Share product link">
                {copied ? <><Link2 size={14} /> Link copied</> : <><Share2 size={14} /> Share</>}
              </button>
            </div>
          </div>

          <ul className="mt-5 grid grid-cols-2 gap-3">
            {NOTES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2 text-xs font-semibold text-ink/70">
                <Icon size={16} className="shrink-0 text-gold-600" /> {text}
              </li>
            ))}
          </ul>

          {product.includes?.length > 0 && (
            <div className="mt-7 border-t border-ink/10 pt-6">
              <h2 className="text-sm font-extrabold">What's in the box</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {product.includes.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-ink/80">
                    <Check size={16} className="mt-0.5 shrink-0 text-gold-600" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-6 text-xs text-ink/60">Prices are per piece and exclude GST. Colours may vary slightly from the photos.</p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-extrabold">You may also like</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {related.map(p => <ProductCard key={p.id} product={p} settings={settings} onAddToCart={onAddToCart} />)}
          </div>
        </section>
      )}
    </div>
  );
}
