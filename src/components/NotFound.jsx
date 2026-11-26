import React from 'react';
import { linkHandler } from '../lib/router';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-5xl font-extrabold text-gold-500">404</p>
      <h1 className="text-xl font-bold">We couldn't find that page</h1>
      <p className="text-sm text-ink/60">The product may have been removed or renamed.</p>
      <a href="/shop" onClick={linkHandler('/shop')} className="btn-dark mt-2">See all gift sets</a>
    </div>
  );
}
