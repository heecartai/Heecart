import React from 'react';
import { Gift, Leaf, ShieldCheck, Truck, Users } from 'lucide-react';

// The five promises printed on the catalog cover.
const FEATURES = [
  { icon: Leaf, title: 'Premium quality' },
  { icon: Gift, title: 'Custom branding' },
  { icon: Users, title: 'Loved by teams & clients' },
  { icon: ShieldCheck, title: 'Long-lasting impression' },
  { icon: Truck, title: 'Bulk orders welcome' },
];

export default function Features() {
  return (
    <section className="border-b border-ink/10 bg-white">
      <div className="no-scrollbar mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-5 sm:px-6 md:justify-between lg:px-8">
        {FEATURES.map(({ icon: Icon, title }) => (
          <div key={title} className="flex shrink-0 items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-gold-500 text-ink">
              <Icon size={17} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wide text-ink/80">{title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
