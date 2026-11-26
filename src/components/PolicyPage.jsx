import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { linkHandler } from '../lib/router';

const UPDATED = '29 October 2026';
const BUSINESS = 'Heecart Gifts and More';

// Each policy is a list of sections; a body entry is a paragraph, or { list: [...] } for bullet points.
export const POLICIES = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    intro: s => `${BUSINESS} ("Heecart", "we", "us") respects your privacy. This policy explains what information we collect when you use this website or order from us, and how we use and protect it, in line with applicable Indian law, including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023.`,
    sections: s => [
      {
        heading: 'Information we collect',
        body: [
          'We only collect what we need to process your order and serve you:',
          { list: [
            'Contact and delivery details you enter at checkout: name, mobile number, email, company name, GSTIN and delivery address.',
            'Order details: the products, quantities, personalisation text and notes you choose.',
            'Messages, logos and files you send us on WhatsApp, email or phone.',
            'Basic technical data (such as IP address and browser type) that our website hosting provider records automatically to keep the site secure and working.',
          ] },
        ],
      },
      {
        heading: 'How your details reach us',
        body: [
          'This website does not have customer accounts and does not store your order on our own servers. Your cart and delivery details are saved in your own browser so you don\'t have to type them again. They are sent to us only when you tap "Place order", which opens WhatsApp with your order filled in, and you choose to send that message.',
          'Messages sent through WhatsApp are also handled by WhatsApp (Meta) under its own privacy policy.',
        ],
      },
      {
        heading: 'How we use your information',
        body: [{ list: [
          'To confirm, personalise, invoice, pack and deliver your order.',
          'To contact you about your order, payment, artwork approval or delivery.',
          'To issue GST invoices and meet our legal and accounting obligations.',
          'To answer your questions and provide support.',
          'Occasionally, to tell you about offers. You can ask us to stop at any time.',
        ] }],
      },
      {
        heading: 'Sharing your information',
        body: [
          'We never sell or rent your personal information. We share it only when needed to complete your order or when required by law:',
          { list: [
            'With courier and logistics partners, so they can deliver your order.',
            'With payment apps and banks, when you pay us by UPI or bank transfer.',
            'With government or legal authorities, when required by law.',
          ] },
        ],
      },
      {
        heading: 'Data security and retention',
        body: [
          'We take reasonable steps to keep your information safe and limit access to the people who need it to serve you. We keep order and invoice records for as long as required by tax and accounting laws, and other information only for as long as it is useful for serving you.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          `You can ask us to access, correct or delete your personal information, or to stop sending you offers, by writing to ${s.email} or messaging us on WhatsApp at ${s.phone_display}. You can clear the details saved in your browser at any time by clearing this site's data in your browser settings.`,
        ],
      },
      {
        heading: 'Children',
        body: ['Our website and products are meant for businesses and adults. We do not knowingly collect information from children under 18.'],
      },
      {
        heading: 'Changes to this policy',
        body: ['We may update this policy from time to time. The latest version will always be on this page, with the date it was last updated.'],
      },
    ],
  },
  {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    intro: () => `These terms apply when you use this website or place an order with ${BUSINESS}. By placing an order, you agree to them.`,
    sections: s => [
      {
        heading: 'Products and images',
        body: ['We make every effort to show our products accurately. Actual colours, finishes and packaging may vary slightly from the photos because of screen settings and supplier batches. Item contents can occasionally change; if anything in your set changes, we will tell you before you pay.'],
      },
      {
        heading: 'Prices',
        body: [
          'Prices are shown per piece in Indian Rupees and exclude GST. Prices depend on the quantity slab you order. Shipping is charged separately unless your order qualifies for a free-shipping offer. We may change prices at any time, but the price we confirm with you on WhatsApp is the price you pay.',
        ],
      },
      {
        heading: 'Orders',
        body: ['Placing an order on this website sends your order request to us on WhatsApp. Your order is confirmed only after we accept it on WhatsApp and receive your payment. We may decline an order, for example if an item is unavailable, and will refund any amount already paid in that case.'],
      },
      {
        heading: 'Personalisation and artwork',
        body: [
          'You are responsible for making sure you have the right to use any logo, name or text you ask us to print. Please check spellings and artwork carefully when we share them for approval. Once you approve the artwork, we are not responsible for errors in the approved content.',
        ],
      },
      {
        heading: 'Payment',
        body: ['We accept payment by UPI (via the QR code we share on WhatsApp) and bank transfer. Unless we agree otherwise in writing, orders are processed after full payment.'],
      },
      {
        heading: 'Shipping, returns and cancellations',
        body: ['Delivery, returns, refunds and cancellations are covered by our Shipping Policy and our Returns, Refunds & Cancellation policy, which form part of these terms.'],
      },
      {
        heading: 'Limitation of liability',
        body: ['To the extent allowed by law, our total liability for any order is limited to the amount you paid for that order. We are not liable for indirect losses or for delays caused by events outside our control.'],
      },
      {
        heading: 'Governing law',
        body: ['These terms are governed by the laws of India. Any dispute will be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.'],
      },
    ],
  },
  {
    slug: 'shipping-policy',
    title: 'Shipping Policy',
    intro: () => 'We deliver across India through trusted courier partners. Here is how shipping works.',
    sections: s => [
      {
        heading: 'Processing time',
        body: ['Production starts once you approve the artwork and payment is received. Because every order is personalised, timelines depend on the products and quantity. We always share the expected dispatch date on WhatsApp before you pay. Large bulk orders may need extra time.'],
      },
      {
        heading: 'Shipping charges',
        body: [
          `Shipping is free on eligible orders during our free-shipping offers (the minimum order value is shown on the website while an offer is running). For other orders, shipping is charged by weight and delivery location, and we confirm the exact amount on WhatsApp before you pay.`,
        ],
      },
      {
        heading: 'Tracking',
        body: ['Once your order is dispatched, we send the courier name and tracking number on WhatsApp so you can follow your delivery.'],
      },
      {
        heading: 'Delivery',
        body: [
          'Delivery times depend on your location and the courier. Remote areas can take longer. Please make sure your address, pincode and phone number are correct; we are not responsible for delays or losses caused by incorrect details.',
          'Delays caused by weather, strikes, holidays or other events outside our control are not our responsibility, but we will always help you follow up with the courier.',
        ],
      },
      {
        heading: 'Damaged parcels',
        body: [`If your parcel arrives damaged, please record an unboxing video and contact us within 48 hours of delivery at ${s.phone_display} or ${s.email}. See our Returns, Refunds & Cancellation policy for what happens next.`],
      },
    ],
  },
  {
    slug: 'return-policy',
    title: 'Returns, Refunds & Cancellation',
    intro: () => 'Most of our gifts are personalised just for you, so we take extra care to get them right. Here is what happens if something goes wrong.',
    sections: s => [
      {
        heading: 'Personalised products',
        body: ['Items printed or engraved with your logo, names or text are made to order and cannot be returned or exchanged for a change of mind, a wrong size or colour choice, or errors in artwork you approved.'],
      },
      {
        heading: 'Damaged, defective or wrong items',
        body: [
          'If you receive an item that is damaged in transit, defective, different from what you ordered, or has a printing mistake made by us, we will replace it or refund you for that item.',
          { list: [
            `Tell us within 48 hours of delivery on WhatsApp (${s.phone_display}) or by email (${s.email}).`,
            'Share your order ID, clear photos of the issue and an unboxing video.',
            'Keep the item and its original packaging until we have reviewed your request.',
          ] },
          'Once we approve your request, we will arrange a replacement or a refund as quickly as possible.',
        ],
      },
      {
        heading: 'Refunds',
        body: ['Approved refunds are made to your original payment method (UPI or bank account) within 7 working days of approval. Shipping charges are refunded only when the problem was our mistake.'],
      },
      {
        heading: 'Cancellations',
        body: [
          'You can cancel your order for a full refund any time before we start printing or production. Because personalised items are made specially for you, orders cannot be cancelled once production has started.',
        ],
      },
      {
        heading: 'Need help?',
        body: [`Message us on WhatsApp at ${s.phone_display} or email ${s.email}. We're happy to help.`],
      },
    ],
  },
  {
    slug: 'cookie-policy',
    title: 'Cookie Policy',
    intro: () => 'This page explains how this website uses cookies and similar browser storage.',
    sections: () => [
      {
        heading: 'We do not use tracking cookies',
        body: ['This website does not use advertising cookies, tracking cookies or third-party analytics, so we do not show a cookie consent banner.'],
      },
      {
        heading: 'What we store in your browser',
        body: [
          "To make shopping easier, the site uses your browser's local storage (which works like a cookie but never leaves your device on its own) to remember:",
          { list: [
            'the items in your cart, so they are still there when you come back;',
            'the delivery details you entered, so you do not have to type them again.',
          ] },
          'This information is not sent to us or anyone else unless you choose to send your order on WhatsApp.',
        ],
      },
      {
        heading: 'Third-party services',
        body: ['When you tap a WhatsApp or Instagram link, you leave our website and those services may use their own cookies under their own policies. Our fonts are loaded from Google Fonts, which may log basic technical information such as your IP address.'],
      },
      {
        heading: 'Managing storage',
        body: ["You can clear your cart and saved details at any time by clearing this site's data in your browser settings."],
      },
      {
        heading: 'Changes',
        body: ['If we add analytics or other cookies in the future, we will update this page and ask for your consent where required.'],
      },
    ],
  },
];

export default function PolicyPage({ policy, settings }) {
  return (
    <div className="bg-cream/50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
        <a href="/" onClick={linkHandler('/')} className="flex items-center gap-1 text-xs text-ink/60 hover:text-ink">
          <ChevronLeft size={14} /> Home
        </a>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">{policy.title}</h1>
        <p className="mt-2 text-xs text-ink/60">Last updated: {UPDATED}</p>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm leading-relaxed text-ink/80">{policy.intro(settings)}</p>
          {policy.sections(settings).map(section => (
            <section key={section.heading} className="mt-8">
              <h2 className="text-lg font-bold">{section.heading}</h2>
              {section.body.map((part, i) =>
                typeof part === 'string' ? (
                  <p key={i} className="mt-3 text-sm leading-relaxed text-ink/75">{part}</p>
                ) : (
                  <ul key={i} className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-ink/75 marker:text-gold-600">
                    {part.list.map(item => <li key={item}>{item}</li>)}
                  </ul>
                ),
              )}
            </section>
          ))}

          <div className="mt-10 rounded-2xl bg-cream p-5 text-sm">
            <p className="font-bold">{BUSINESS}</p>
            <p className="mt-1 text-ink/70">{settings.address}</p>
            <p className="mt-1 text-ink/70">Phone / WhatsApp: {settings.phone_display} · Email: {settings.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
