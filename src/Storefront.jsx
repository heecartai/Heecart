import React, { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { store } from './lib/store';
import { minOrderQty, lowestPrice, formatINR } from './lib/pricing';
import Header from './components/Header';
import HomePage from './components/HomePage';
import ShopPage from './components/ShopPage';
import ProductPage from './components/ProductPage';
import CartDrawer from './components/CartDrawer';
import PolicyPage, { POLICIES } from './components/PolicyPage';
import { applySeo, SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION } from './lib/seo';
import Footer from './components/Footer';
import MobileNav from './components/MobileNav';
import NotFound from './components/NotFound';

const CART_KEY = 'heecart_cart';

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

export default function Storefront({ route }) {
  const [cart, setCart] = useState(readCart);
  const [cartView, setCartView] = useState(null); // null (closed) | 'cart' | 'checkout'
  const [toast, setToast] = useState('');

  useEffect(() => {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }, [cart]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  // The saved cart keeps only product ids; use the current product data (prices may have changed)
  // and drop products that were removed or hidden since.
  const cartItems = useMemo(() => {
    const byId = Object.fromEntries(store.products.map(p => [p.id, p]));
    return cart.filter(item => byId[item.id]).map(item => ({ ...item, product: byId[item.id] }));
  }, [cart]);

  const addToCart = (product, qty = minOrderQty(product), printText = '', { checkout = false } = {}) => {
    setCart(prev => {
      const existing = prev.findIndex(i => i.id === product.id && i.printText === printText);
      if (existing >= 0) {
        return prev.map((item, i) => (i === existing ? { ...item, qty: checkout ? qty : item.qty + qty } : item));
      }
      return [...prev, { id: product.id, qty, printText }];
    });
    if (checkout) setCartView('checkout');
    else setToast(`Added "${product.name}" to your cart`);
  };

  // The drawer works with cartItems, so match items by id + print text rather than by index.
  const sameItem = target => item => item.id === target.product.id && item.printText === target.printText;
  const updateCart = (target, patch) => setCart(prev => prev.map(item => (sameItem(target)(item) ? { ...item, ...patch } : item)));
  const removeFromCart = target => setCart(prev => prev.filter(item => !sameItem(target)(item)));

  const { path, search } = route;
  const productId = path.startsWith('/p/') ? decodeURIComponent(path.slice(3)) : null;
  const product = productId && store.products.find(p => p.id === productId);
  const policy = POLICIES.find(p => `/${p.slug}` === path);

  useEffect(() => {
    if (product) {
      const low = lowestPrice(product);
      const cat = store.categories.find(c => c.id === product.category);
      const desc = `${product.name}${cat ? ` (${cat.name})` : ''}: ${String(product.description || '').slice(0, 120).trim()} Custom logo branding, bulk prices${low ? ` from ${formatINR(low)}` : ''}. Order on WhatsApp.`;
      applySeo({
        title: `${product.name} - Custom Corporate Gift Set | Heecart Chennai`,
        description: desc,
        path: path,
        image: product.image,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: [product.image, ...(product.gallery || [])].filter(Boolean).map(i => (i.startsWith('http') ? i : `${SITE_URL}${i}`)),
          brand: { '@type': 'Brand', name: 'Heecart' },
          category: cat ? cat.name : 'Corporate gifts',
          ...(low ? { offers: { '@type': 'Offer', priceCurrency: 'INR', price: String(low), availability: 'https://schema.org/InStock', url: `${SITE_URL}${path}` } } : {}),
        },
      });
    } else if (policy) {
      applySeo({ title: `${policy.title} | ${SITE_NAME}`, path });
    } else if (path === '/shop') {
      applySeo({
        title: 'Shop Corporate Gifts in Chennai - Combo Sets, Diaries, Bottles | Heecart',
        description: 'Browse custom-branded corporate gift combos: pen and keychain sets, diary and pen combos, 3-in-1 and 4-in-1 sets, premium and welcome kits. Bulk pricing from 5 pieces.',
        path,
      });
    } else if (path === '/') {
      applySeo({
        title: 'Corporate Gifts Chennai | Custom Branded Combo Gift Sets - Heecart',
        path,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Store',
          name: SITE_NAME,
          url: SITE_URL,
          logo: `${SITE_URL}/logo.png`,
          image: `${SITE_URL}/products/catalog-cover.jpg`,
          description: DEFAULT_DESCRIPTION,
          telephone: `+${store.settings.whatsapp}`,
          email: store.settings.email,
          sameAs: store.settings.instagram ? [`https://www.instagram.com/${store.settings.instagram}`] : [],
          address: { '@type': 'PostalAddress', streetAddress: store.settings.address, addressLocality: 'Chennai', addressRegion: 'Tamil Nadu', postalCode: '600005', addressCountry: 'IN' },
          areaServed: 'IN',
        },
      });
    } else {
      applySeo({ title: `Page not found | ${SITE_NAME}`, path, noindex: true });
    }
  }, [product, policy, path, store]);

  const shared = { settings: store.settings, onAddToCart: addToCart };

  let page;
  if (path === '/') page = <HomePage store={store} {...shared} />;
  else if (path === '/shop') page = <ShopPage products={store.products} categories={store.categories} search={search} {...shared} />;
  else if (product) page = <ProductPage key={product.id} product={product} products={store.products} categories={store.categories} {...shared} />;
  else if (policy) page = <PolicyPage policy={policy} settings={store.settings} />;
  else page = <NotFound />;

  const cartCount = cartItems.length;
  const openCart = () => setCartView('cart');

  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Header settings={store.settings} search={search} cartCount={cartCount} onOpenCart={openCart} />
      <main className="flex-1">{page}</main>
      <Footer settings={store.settings} categories={store.categories} />
      <MobileNav settings={store.settings} cartCount={cartCount} onOpenCart={openCart} />

      <CartDrawer
        view={cartView}
        onViewChange={setCartView}
        items={cartItems}
        settings={store.settings}
        onUpdate={updateCart}
        onRemove={removeFromCart}
        onClear={() => setCart([])}
      />

      {toast && (
        <div className="animate-fade-in fixed bottom-20 left-1/2 z-50 flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-xl bg-ink px-4 py-3 text-xs font-semibold text-white shadow-xl md:bottom-6">
          <Check size={15} className="shrink-0 text-gold-400" />
          <span className="truncate">{toast}</span>
          <button onClick={() => { setToast(''); openCart(); }} className="ml-2 shrink-0 text-gold-400 underline">View cart</button>
        </div>
      )}
    </div>
  );
}
