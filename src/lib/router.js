import { useEffect, useState } from 'react';

// A tiny history-based router: the site only has a handful of routes.

const current = () => ({ path: window.location.pathname.replace(/\/+$/, '') || '/', search: window.location.search });

export function useRoute() {
  const [route, setRoute] = useState(current);
  useEffect(() => {
    const onChange = () => setRoute(current());
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  }, []);
  return route;
}

export function navigate(to, { replace = false, keepScroll = false } = {}) {
  if (to === window.location.pathname + window.location.search) return;
  window.history[replace ? 'replaceState' : 'pushState']({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
  if (!keepScroll) window.scrollTo({ top: 0 });
}

// Use on <a href> so links still work with middle-click / open in new tab.
export function linkHandler(to) {
  return e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    navigate(to);
  };
}

export const CRM_PATH = `/${(import.meta.env.VITE_CRM_PATH || 'venkatesh').replace(/^\/+|\/+$/g, '')}`;
