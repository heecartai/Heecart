import React from 'react';
import {
  ArrowRight, Award, BadgeIndianRupee, Briefcase, Building2, Gift, Handshake, Layers, MessageCircle,
  PartyPopper, PenLine, Sparkles, Truck, UserPlus, Users,
} from 'lucide-react';
import ProductCard from './ProductCard';
import WhatsAppIcon from './WhatsAppIcon';
import Instagram from './InstagramIcon';
import { linkHandler, navigate } from '../lib/router';
import { shopHref } from './ShopPage';
import { freeShippingOffer, offerScope, pad, useCountdown } from '../lib/offer';
import { formatINR, savingsPercent, sortedTiers } from '../lib/pricing';
import { whatsappLink } from '../lib/whatsapp';

export function showCategory(id) {
  navigate(shopHref({ c: id }));
}

function Eyebrow({ children, light }) {
  return <p className={`text-xs font-bold uppercase tracking-[0.2em] ${light ? 'text-gold-400' : 'text-gold-800'}`}>{children}</p>;
}

export function OfferStrip({ settings }) {
  const offer = freeShippingOffer(settings);
  const left = useCountdown(offer?.end);
  if (!offer || !left) return null;
  const units = [
    ...(left.days ? [[left.days, 'd']] : []),
    [left.hours, 'h'],
    [left.minutes, 'm'],
    [left.seconds, 's'],
  ];

  return (
    <section className="bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 text-ink">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-4 sm:px-6 md:flex-row md:justify-between lg:px-8">
        <p className="flex items-center gap-2 text-center text-sm font-bold sm:text-base">
          <Truck size={20} className="shrink-0" />
          FREE shipping {offerScope(offer, formatINR)}. {offer.daily ? "Today's offer ends in" : 'Offer ends in'}
        </p>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 font-mono" role="timer" aria-label="Time left in the offer">
            {units.map(([value, unit]) => (
              <span key={unit} className="min-w-[3rem] rounded-lg bg-ink px-2 py-1.5 text-center text-sm font-bold text-gold-400">
                {pad(value)}<span className="text-xs text-white/60">{unit}</span>
              </span>
            ))}
          </div>
          <a href="/shop" onClick={linkHandler('/shop')} className="hidden rounded-lg bg-ink px-4 py-2 text-xs font-bold text-white hover:bg-ink-700 sm:block">Shop now</a>
        </div>
      </div>
    </section>
  );
}

const CATEGORY_TAGLINES = {
  'pen-keychain': 'Smart first impressions',
  'diary-pen': "Desk companions they'll use daily",
  '3-in-1': 'Our most-gifted combos',
  '4-in-1': 'More pieces, more wow',
  'premium-kits': 'Executive kits with laptop bags',
  'welcome-kits': 'Make day one unforgettable',
};

export function CategoryTiles({ products, categories }) {
  const tiles = categories
    .map(c => ({ ...c, cover: products.find(p => p.category === c.id && p.featured) || products.find(p => p.category === c.id) }))
    .filter(c => c.cover);

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <Eyebrow>Shop by category</Eyebrow>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Find the perfect gift in seconds</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {tiles.map(c => (
            <button
              key={c.id}
              onClick={() => showCategory(c.id)}
              className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-ink text-left"
            >
              <img src={c.cover.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-110 group-hover:opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                <p className="text-xs font-semibold text-gold-300 sm:text-xs">{CATEGORY_TAGLINES[c.id] || 'Explore the collection'}</p>
                <p className="mt-1 text-base font-extrabold text-white sm:text-xl">{c.name}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-400 group-hover:gap-2">
                  Shop now <ArrowRight size={14} />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Bestsellers({ products, settings, onAddToCart }) {
  const picks = products.filter(p => p.featured).slice(0, 10);
  if (!picks.length) return null;
  return (
    <section id="bestsellers" className="scroll-mt-28 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <Eyebrow>Bestsellers</Eyebrow>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">The gifts companies keep coming back for</h2>
          </div>
          <a href="/shop" onClick={linkHandler('/shop')} className="hidden shrink-0 items-center gap-1 text-sm font-bold text-gold-800 hover:gap-2 sm:flex">View all <ArrowRight size={16} /></a>
        </div>
        <div className="no-scrollbar -mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {picks.map(p => (
            <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%]">
              <ProductCard product={p} settings={settings} onAddToCart={onAddToCart} />
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <a href="/shop" onClick={linkHandler('/shop')} className="btn-dark px-8">Browse all gifts <ArrowRight size={16} /></a>
        </div>
      </div>
    </section>
  );
}

export function WhyHeecart({ settings }) {
  const points = [
    { icon: PenLine, title: 'Personalised for every person', text: "Their name on the diary, the bottle, the pen. It's the detail people remember and talk about." },
    { icon: Gift, title: 'Luxury unboxing, every time', text: 'Each set arrives in a premium fitted gift box, ready to hand over with no extra wrapping needed.' },
    { icon: BadgeIndianRupee, title: 'Bulk prices that scale', text: 'Prices drop at 5, 30 and 100 pieces, so the more people you thank, the more you save.' },
    { icon: MessageCircle, title: 'One WhatsApp chat', text: 'No long forms. Send your cart, approve your branding and track everything in one conversation.' },
    { icon: Layers, title: 'From 1 piece to 1,000+', text: 'Order a single sample to check quality, then scale up for the whole company.' },
    { icon: Award, title: settings.trust_orders ? `${settings.trust_orders} orders delivered` : 'Trusted by businesses', text: settings.trust_since ? `Gifting for companies, teams and families since ${settings.trust_since}.` : 'Gifting for companies, teams and families.' },
  ];

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="max-w-2xl">
          <Eyebrow light>Why Heecart</Eyebrow>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-4xl">A gift is a handshake that lasts all year</h2>
          <p className="mt-3 text-sm text-white/60 sm:text-base">
            Cheap gifts end up in drawers. Ours end up on desks, in bags and in meetings, carrying your name with them.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {points.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-gold-500/50 hover:bg-white/[0.06]">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-500 text-ink"><Icon size={22} /></span>
              <h3 className="mt-4 text-lg font-bold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BulkSavings({ products }) {
  const example = products.find(p => p.id === 'diary-bottle-pen-combo-1') || products.find(p => sortedTiers(p).length > 2) || products[0];
  if (!example) return null;
  const tiers = sortedTiers(example);
  const top = tiers[0]?.price || 1;

  return (
    <section id="bulk-savings" className="scroll-mt-28 bg-gradient-to-br from-cream via-white to-gold-50">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20 lg:px-8">
        <div>
          <Eyebrow>Bulk savings</Eyebrow>
          <h2 className="mt-2 text-2xl font-extrabold sm:text-4xl">Thank more people. Pay less per gift.</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink/70 sm:text-base">
            Every gift set has quantity slabs. Order 5, 30 or 100+ pieces and the price per piece drops automatically,
            often by a quarter or more. You'll see your exact savings on every product page before you order.
          </p>
          <a href={`/p/${example.id}`} onClick={e => { e.preventDefault(); navigate(`/p/${example.id}`); }} className="btn-dark mt-6">
            See it on {example.name} <ArrowRight size={16} />
          </a>
        </div>

        <div className="rounded-3xl border border-ink/10 bg-white p-5 shadow-xl shadow-gold-500/10 sm:p-7">
          <div className="flex items-center gap-4">
            <img src={example.image} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            <div>
              <p className="text-xs font-semibold text-ink/60">Example</p>
              <p className="font-bold">{example.name}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {tiers.map(t => {
              const save = savingsPercent(example, t.price);
              return (
                <div key={t.min}>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-semibold">{t.label}</span>
                    <span>
                      <strong>{formatINR(t.price)}</strong>
                      <span className="text-ink/60">/pc</span>
                      {save > 0 && <span className="ml-2 rounded-md bg-green-100 px-1.5 py-0.5 text-xs font-bold text-green-800">Save {save}%</span>}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-cream">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-600" style={{ width: `${(t.price / top) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const OCCASIONS = [
  { icon: UserPlus, title: 'Employee onboarding', text: 'Welcome kits that make new hires feel at home on day one.', category: 'welcome-kits' },
  { icon: PartyPopper, title: 'Diwali & festivals', text: 'Festive combos your team will actually look forward to.', category: '3-in-1' },
  { icon: Handshake, title: 'Client appreciation', text: 'Executive kits that keep you top of mind all year.', category: 'premium-kits' },
  { icon: Users, title: 'Conferences & events', text: 'Elegant giveaways that make your stall the busiest one.', category: 'pen-keychain' },
  { icon: Award, title: 'Awards & anniversaries', text: 'Personalised diaries for milestones worth celebrating.', category: 'diary-pen' },
  { icon: Building2, title: 'Dealer & partner meets', text: 'Four-piece sets that say "we value this partnership".', category: '4-in-1' },
];

export function Occasions({ categories }) {
  const known = new Set(categories.map(c => c.id));
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <Eyebrow>Gifts for every occasion</Eyebrow>
      <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">Whatever you're celebrating, we've got the gift</h2>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {OCCASIONS.map(({ icon: Icon, title, text, category }) => (
          <button
            key={title}
            onClick={() => showCategory(known.has(category) ? category : '')}
            className="group flex items-start gap-4 rounded-3xl border border-ink/10 p-5 text-left transition hover:-translate-y-0.5 hover:border-gold-500 hover:shadow-lg"
          >
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cream text-gold-700 transition group-hover:bg-gold-500 group-hover:text-ink"><Icon size={22} /></span>
            <span>
              <span className="block font-bold">{title}</span>
              <span className="mt-1 block text-sm text-ink/60">{text}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function InstagramBand({ settings }) {
  if (!settings.instagram) return null;
  const handle = settings.instagram.replace(/^@/, '');
  return (
    <section className="bg-gradient-to-r from-[#3b0a45] via-[#8a1c5c] to-[#d9771f] text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-4 py-10 text-center sm:px-6 md:flex-row md:justify-between md:text-left lg:px-8">
        <div className="flex items-center gap-4">
          <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/15 sm:grid"><Instagram size={28} /></span>
          <div>
            <p className="text-xl font-extrabold sm:text-2xl">See real gifts we've delivered</p>
            <p className="text-sm text-white/80">Fresh unboxings, custom branding and festive ideas on Instagram @{handle}</p>
          </div>
        </div>
        <a href={`https://www.instagram.com/${handle}`} target="_blank" rel="noopener" className="btn bg-white text-ink hover:bg-white/90">
          <Instagram size={18} /> Follow @{handle}
        </a>
      </div>
    </section>
  );
}

export function FinalCTA({ settings }) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(245,179,1,0.35),transparent_60%)]" />
      <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 md:py-20">
        <Sparkles className="mx-auto text-gold-400" size={28} />
        <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">Your next gift could be the one they never forget.</h2>
        <p className="mt-3 text-white/60">Pick a set, add your logo, and we'll take care of the rest. It takes two minutes to order.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href="/shop" onClick={linkHandler('/shop')} className="btn-gold px-6 py-3.5 text-base">Start shopping <ArrowRight size={18} /></a>
          <a href={whatsappLink(settings.whatsapp, 'Hi Heecart! I need help choosing corporate gifts.')} target="_blank" rel="noopener" className="btn-whatsapp px-6 py-3.5 text-base">
            <WhatsAppIcon size={18} /> Talk to us on WhatsApp
          </a>
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-xs text-white/60"><Briefcase size={14} /> Bulk & corporate orders welcome</p>
      </div>
    </section>
  );
}
