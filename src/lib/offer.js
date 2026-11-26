import { useEffect, useState } from 'react';

// Free-shipping offer, switched on and configured in the CRM settings.
// With no end date set, it runs as a daily offer that counts down to midnight.
export function freeShippingOffer(settings, now = new Date()) {
  if (!settings.free_shipping_enabled) return null;
  let end;
  if (settings.offer_ends_at) {
    end = new Date(settings.offer_ends_at);
    if (Number.isNaN(end.getTime()) || end <= now) return null;
  } else {
    end = new Date(now);
    end.setHours(24, 0, 0, 0);
  }
  return { min: Number(settings.free_shipping_min) || 0, end, daily: !settings.offer_ends_at };
}

// "on every order" or "on orders above ₹X", for the offer messages.
export const offerScope = (offer, formatINR) =>
  offer.min > 0 ? `on orders above ${formatINR(offer.min)}` : 'on every order';

export function useCountdown(end) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!end) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [end]);
  if (!end) return null;
  const left = Math.max(0, end.getTime() - now);
  return {
    days: Math.floor(left / 86400000),
    hours: Math.floor(left / 3600000) % 24,
    minutes: Math.floor(left / 60000) % 60,
    seconds: Math.floor(left / 1000) % 60,
  };
}

export const pad = n => String(n).padStart(2, '0');
