import React, { useRef, useState } from 'react';
import { ArrowRight, BadgeCheck, Package, Sparkles } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { linkHandler } from '../lib/router';
import { whatsappLink } from '../lib/whatsapp';

// A gold gift box spinning in 3D, ringed by real product photos orbiting around it.
function GiftScene({ products }) {
  const [tilt, setTilt] = useState({ x: -8, y: 0 });
  const ref = useRef(null);
  const ring = products.slice(0, 10);

  const onMove = e => {
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -8 - py * 14, y: px * 20 });
  };

  return (
    <div
      ref={ref}
      className="hero-scene relative h-[340px] select-none sm:h-[440px]"
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ x: -8, y: 0 })}
      aria-hidden="true"
    >
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500/30 blur-3xl sm:h-80 sm:w-80" />
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="hero-spark" style={{ '--x': `${(i * 37) % 100}%`, '--y': `${(i * 53) % 100}%`, '--d': `${(i % 5) * 0.8}s` }} />
      ))}

      <div className="hero-tilt" style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
        <div className="hero-ring" style={{ '--n': ring.length }}>
          {ring.map((p, i) => (
            <a
              key={p.id}
              href={`/p/${p.id}`}
              onClick={linkHandler(`/p/${p.id}`)}
              className="hero-card"
              style={{ '--i': i }}
              tabIndex={-1}
            >
              <img src={p.image} alt="" loading="eager" />
            </a>
          ))}
        </div>

        <div className="hero-cube">
          {['front', 'back', 'right', 'left', 'top', 'bottom'].map(face => (
            <span key={face} className={`hero-face hero-face-${face}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Hero({ products, settings }) {
  const featured = [...products.filter(p => p.featured), ...products.filter(p => !p.featured)];

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_45%,rgba(245,179,1,0.22),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 pb-10 pt-10 sm:px-6 md:grid-cols-[1.05fr_1fr] md:pb-16 md:pt-16 lg:px-8">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-300 sm:text-xs">
            <Sparkles size={14} /> Corporate gifting, done beautifully
          </p>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            Gifts that make your brand <span className="bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300 bg-clip-text text-transparent">unforgettable.</span>
          </h1>
          <p className="mt-3 font-script text-2xl text-gold-200 sm:text-3xl">Thoughtful gifts for a stronger business bond</p>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Premium diaries, bottles, pens and executive kits, personalised with your logo or each person's name and
            delivered in luxury gift boxes. The more you order, the less you pay per piece.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/shop" onClick={linkHandler('/shop')} className="btn-gold px-6 py-3.5 text-base shadow-lg shadow-gold-500/20">
              Shop gift sets <ArrowRight size={18} />
            </a>
            <a
              href={whatsappLink(settings.whatsapp, 'Hi Heecart! I need corporate gifts. Can you help me choose?')}
              target="_blank"
              rel="noopener"
              className="btn border border-white/20 px-6 py-3.5 text-base text-white hover:bg-white/10"
            >
              <WhatsAppIcon size={18} className="text-whatsapp" /> Get a quick quote
            </a>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3 border-t border-white/10 pt-6">
            {settings.trust_orders && (
              <div>
                <dd className="text-xl font-extrabold text-gold-400 sm:text-2xl">{settings.trust_orders}</dd>
                <dt className="text-xs text-white/50 sm:text-xs">Orders delivered</dt>
              </div>
            )}
            {settings.trust_since && (
              <div>
                <dd className="text-xl font-extrabold text-gold-400 sm:text-2xl">Since {settings.trust_since}</dd>
                <dt className="text-xs text-white/50 sm:text-xs">Trusted by businesses</dt>
              </div>
            )}
            <div>
              <dd className="text-xl font-extrabold text-gold-400 sm:text-2xl">1 pc+</dd>
              <dt className="text-xs text-white/50 sm:text-xs">No big minimums</dt>
            </div>
          </dl>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/60">
            <li className="flex items-center gap-1.5"><BadgeCheck size={14} className="text-gold-400" /> Your logo on every piece</li>
            <li className="flex items-center gap-1.5"><Package size={14} className="text-gold-400" /> Luxury gift-box packing</li>
          </ul>
        </div>

        <GiftScene products={featured} />
      </div>
    </section>
  );
}
