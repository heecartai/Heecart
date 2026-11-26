import React, { useState } from 'react';
import { ChevronDown, CreditCard, MessageCircle, MousePointerClick, PackageCheck } from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { whatsappLink } from '../lib/whatsapp';

const STEPS = [
  { icon: MousePointerClick, title: 'Choose your gifts', text: 'Pick a set, choose your quantity and add the name or company you want printed.' },
  { icon: MessageCircle, title: 'Place your order', text: 'Add your delivery address and tap "Place order". Your full order lands in our WhatsApp instantly.' },
  { icon: CreditCard, title: 'Confirm & pay', text: 'We confirm your branding and send a payment QR. Pay in seconds with GPay, PhonePe or any UPI app.' },
  { icon: PackageCheck, title: 'Unbox the smiles', text: 'Your custom gifts are packed in premium boxes and delivered to your door.' },
];

export function HowToOrder({ settings }) {
  return (
    <section id="how-to-order" className="scroll-mt-28 bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-800">How it works</p>
        <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">From cart to doorstep in four easy steps</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-3xl bg-white p-6 shadow-sm">
              <span className="absolute right-5 top-4 text-4xl font-extrabold text-gold-500/25">{i + 1}</span>
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-gold-400"><Icon size={22} /></span>
              <h3 className="mt-4 font-bold">{title}</h3>
              <p className="mt-1 text-sm text-ink/60">{text}</p>
            </li>
          ))}
        </ol>
        <a
          href={whatsappLink(settings.whatsapp, 'Hi Heecart! I have a question about corporate gifts.')}
          target="_blank"
          rel="noopener"
          className="btn-whatsapp mt-8"
        >
          <WhatsAppIcon size={18} /> Prefer to chat first? Message us
        </a>
      </div>
    </section>
  );
}

const faqs = settings => [
  {
    q: 'How do I place an order?',
    a: 'Add gift sets to your cart, tap Checkout and fill in your delivery address. Tapping "Place order" sends your complete order to our WhatsApp. We confirm the details and send you a payment QR.',
  },
  {
    q: 'How do I pay?',
    a: "After we confirm your order on WhatsApp, we share a payment QR. Pay with GPay, PhonePe, Paytm or any UPI app. You don't pay anything on the website.",
  },
  {
    q: 'Can you print our company name or logo?',
    a: 'Yes, every gift set can be personalised. Type the name on the product page, and send your logo file to us on WhatsApp. We confirm how it will look before we print.',
  },
  {
    q: 'How do bulk prices work?',
    a: "Each gift set has price slabs at 1, 5, 30 and 100+ pieces. Your price per piece drops automatically as your quantity grows, and you'll see the exact saving before you order.",
  },
  {
    q: 'Do prices include GST and shipping?',
    a: 'Prices are per piece and exclude GST. Shipping is free during our free-shipping offers on eligible orders; otherwise we confirm the shipping charge on WhatsApp before you pay.',
  },
  {
    q: 'Can I order just one piece first?',
    a: 'Yes. Most sets can be ordered from a single piece, so you can check the quality before ordering for the whole team. Welcome kits start at 5 pieces.',
  },
  {
    q: 'Can you make a custom combo?',
    a: "Absolutely. Tell us your budget, quantity and occasion on WhatsApp and we'll suggest the perfect mix.",
  },
  {
    q: 'Where are you located?',
    a: `${settings.address}. Call or WhatsApp ${settings.phone_display}, or email ${settings.email}.`,
  },
];

export function FAQ({ settings }) {
  const [open, setOpen] = useState(0);
  return (
    <section>
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-gold-800">FAQ</p>
        <h2 className="mt-2 text-center text-2xl font-extrabold sm:text-3xl">Everything you need to know</h2>
        <div className="mt-8 divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-white">
          {faqs(settings).map((item, i) => (
            <div key={item.q}>
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold"
                aria-expanded={open === i}
              >
                {item.q}
                <ChevronDown size={18} className={`shrink-0 text-gold-600 transition ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <p className="px-5 pb-4 text-sm leading-relaxed text-ink/70">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
