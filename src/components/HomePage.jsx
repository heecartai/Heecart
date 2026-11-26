import React from 'react';
import Hero from './Hero';
import Features from './Features';
import { HowToOrder, FAQ } from './InfoSections';
import { BulkSavings, Bestsellers, CategoryTiles, FinalCTA, InstagramBand, OfferStrip, Occasions, WhyHeecart } from './HomeSections';

export default function HomePage({ store, settings, onAddToCart }) {
  const { products, categories } = store;

  return (
    <>
      <Hero products={products} settings={settings} />
      <OfferStrip settings={settings} />
      <Features />
      <CategoryTiles products={products} categories={categories} />
      <Bestsellers products={products} settings={settings} onAddToCart={onAddToCart} />
      <WhyHeecart settings={settings} />
      <BulkSavings products={products} />
      <Occasions categories={categories} />
      <HowToOrder settings={settings} />
      <InstagramBand settings={settings} />
      <FAQ settings={settings} />
      <FinalCTA settings={settings} />
    </>
  );
}
