import { cartTotals, formatINR, unitPrice } from './pricing';

export const productUrl = id => `${window.location.origin}/p/${id}`;

export const whatsappLink = (number, text) =>
  `https://wa.me/${String(number).replace(/\D/g, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export function openWhatsApp(number, text) {
  window.open(whatsappLink(number, text), '_blank', 'noopener');
}

// e.g. HC-261029-4821: date plus a random suffix, so the order is easy to refer to on WhatsApp.
export function newOrderId(date = new Date()) {
  const ymd = [date.getFullYear() % 100, date.getMonth() + 1, date.getDate()].map(n => String(n).padStart(2, '0')).join('');
  return `HC-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function buildOrderMessage({ orderId, items, coupon, shippingFree, customer }) {
  const { subtotal, discount, total } = cartTotals(items, coupon);
  const lines = [`*New order ${orderId}*`, ''];

  items.forEach(({ product, qty, printText }, i) => {
    const price = unitPrice(product, qty);
    lines.push(`${i + 1}. *${product.name}* (${product.set_type})`);
    lines.push(price ? `   ${qty} pcs × ${formatINR(price)} = ${formatINR(price * qty)}` : `   ${qty} pcs`);
    if (printText) lines.push(`   Print: ${printText}`);
    lines.push(`   ${productUrl(product.id)}`);
    lines.push('');
  });

  lines.push(`Subtotal: ${formatINR(subtotal)}`);
  if (discount) lines.push(`Coupon ${coupon.code}: -${formatINR(discount)}`);
  lines.push(`Shipping: ${shippingFree ? 'FREE (offer)' : 'to be confirmed'}`);
  lines.push(`*Order total: ${formatINR(total)} + GST*`);

  const c = customer;
  lines.push('', '*Deliver to*', c.name, c.phone);
  if (c.email) lines.push(c.email);
  if (c.company) lines.push(c.company + (c.gstin ? ` (GSTIN ${c.gstin})` : ''));
  else if (c.gstin) lines.push(`GSTIN ${c.gstin}`);
  lines.push(c.address, `${c.city}, ${c.state} - ${c.pincode}`);
  if (c.notes) lines.push('', `Notes: ${c.notes}`);

  lines.push('', 'Please confirm my order and send the payment QR.');
  return lines.join('\n');
}
