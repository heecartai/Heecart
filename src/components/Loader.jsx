import React from 'react';

// Full-screen Heecart loader: pulsing logo with a sliding gold bar.
export default function Loader({ label = 'Loading Heecart' }) {
  return (
    <div role="status" aria-label={label} className="fixed inset-0 z-50 grid place-content-center justify-items-center gap-5 bg-cream">
      <img src="/logo.png" alt="" className="h-20 w-20 animate-pulse object-contain motion-reduce:animate-none" />
      <span className="font-script text-3xl text-ink">Heecart</span>
      <div className="h-1 w-36 overflow-hidden rounded bg-gold-200/40">
        <div className="h-full w-2/5 animate-[hcslide_1.1s_ease-in-out_infinite] rounded bg-gold-500 motion-reduce:animate-none" />
      </div>
    </div>
  );
}
