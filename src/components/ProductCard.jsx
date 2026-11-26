import React from 'react';
import { Leaf, ShoppingCart } from 'lucide-react';
import { linkHandler } from '../lib/router';
import { formatINR, lowestPrice, maxSavingsPercent, minOrderQty, startingPrice } from '../lib/pricing';

// `flat` gives the edge-to-edge, hairline-divided grid look on phones (shop page).
export default function ProductCard({ product, onAddToCart, flat }) {
  const href = `/p/${product.id}`;
  const first = startingPrice(product);
  const lowest = lowestPrice(product);
  const save = maxSavingsPercent(product);
  const minQty = minOrderQty(product);

  return (
    <article className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition hover:-translate-y-1 hover:border-gold-500/60 hover:shadow-xl ${flat ? 'max-sm:rounded-none max-sm:border-0 max-sm:hover:translate-y-0 max-sm:hover:shadow-none' : ''}`}>
      <a href={href} onClick={linkHandler(href)} className="relative block aspect-square overflow-hidden bg-cream">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-md bg-ink px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-gold-400">
          {product.set_type}
        </span>
        {save > 0 && (
          <span className="absolute right-2 top-2 rounded-md bg-green-600 px-2 py-1 text-[11px] font-bold uppercase text-white">
            Save up to {save}%
          </span>
        )}
        {product.badge && (
          <span className="absolute bottom-2 left-2 rounded-md bg-gold-500 px-2 py-1 text-[11px] font-bold uppercase text-ink">{product.badge}</span>
        )}
        {product.tags?.includes('eco') && (
          <span className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-green-700" title="Eco-friendly">
            <Leaf size={14} />
          </span>
        )}
      </a>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <a href={href} onClick={linkHandler(href)}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug hover:text-gold-800">{product.name}</h3>
        </a>

        <div className="mt-auto pt-3">
          {first != null && (
            <p className="text-base font-extrabold sm:text-lg">
              {formatINR(first)}
              <span className="text-xs font-medium text-ink/60"> /pc{minQty > 1 ? ` · min ${minQty}` : ''}</span>
            </p>
          )}
          {lowest != null && lowest < first && (
            <p className="text-xs font-semibold text-green-700">Just {formatINR(lowest)}/pc in bulk</p>
          )}
          <button
            onClick={() => onAddToCart(product)}
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-ink text-xs font-bold text-white transition hover:bg-gold-500 hover:text-ink"
          >
            <ShoppingCart size={14} /> Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
