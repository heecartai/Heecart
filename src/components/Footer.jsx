import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import Instagram from './InstagramIcon';
import WhatsAppIcon from './WhatsAppIcon';
import { POLICIES } from './PolicyPage';
import { linkHandler } from '../lib/router';
import { whatsappLink } from '../lib/whatsapp';

export default function Footer({ settings, categories }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`;
  const instagram = settings.instagram?.replace(/^@/, '');

  return (
    <footer className="bg-ink text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] lg:px-8">
        <div>
          <span className="inline-block rounded-2xl bg-cream px-4 py-3">
            <img src="/logo.png" alt="Heecart Gifts and More" className="h-10 w-auto" />
          </span>
          <p className="mt-4 max-w-xs text-sm">
            Premium corporate and personalised gifts{settings.trust_since ? `, crafted with care since ${settings.trust_since}` : ''}. Quality, trust and the best price.
          </p>
          <p className="mt-3 font-script text-xl text-gold-400">Gifting made meaningful</p>
          {instagram && (
            <a href={`https://www.instagram.com/${instagram}`} target="_blank" rel="noopener" className="mt-4 inline-flex items-center gap-2 text-sm hover:text-gold-400">
              <Instagram size={18} className="text-gold-400" /> @{instagram}
            </a>
          )}
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Shop</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.map(c => (
              <li key={c.id}>
                <a href={`/shop?c=${c.id}`} onClick={linkHandler(`/shop?c=${c.id}`)} className="hover:text-gold-400">{c.name}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Policies</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {POLICIES.map(p => (
              <li key={p.slug}>
                <a href={`/${p.slug}`} onClick={linkHandler(`/${p.slug}`)} className="hover:text-gold-400">{p.title}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gold-400">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href={`tel:+${settings.whatsapp}`} className="flex items-center gap-3 hover:text-gold-400">
                <Phone size={16} className="shrink-0 text-gold-400" /> {settings.phone_display}
              </a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-3 break-all hover:text-gold-400">
                <Mail size={16} className="shrink-0 text-gold-400" /> {settings.email}
              </a>
            </li>
            <li>
              <a href={mapsUrl} target="_blank" rel="noopener" className="flex items-start gap-3 hover:text-gold-400">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold-400" /> {settings.address}
              </a>
            </li>
          </ul>
          <a href={whatsappLink(settings.whatsapp, 'Hi Heecart!')} target="_blank" rel="noopener" className="btn-whatsapp mt-5">
            <WhatsAppIcon size={18} /> WhatsApp us
          </a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-white/60 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Heecart Gifts and More, Chennai. All rights reserved.</p>
          <p>
            Website developed with <span role="img" aria-label="love">❤️</span> by{' '}
            <a href="https://www.garitech.co.in" target="_blank" rel="noopener" className="font-semibold text-gold-400 hover:underline">Gari Tech</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
