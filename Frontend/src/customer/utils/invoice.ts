import jsPDF from 'jspdf';
import { format } from 'date-fns';
import type { CustomerOrder } from '@/types/order';

const formatDate = (iso?: string | null) => {
  if (!iso) return 'N/A';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? 'N/A' : format(date, 'PPP');
};

export const generateInvoicePdf = (order: CustomerOrder) => {
  const doc = new jsPDF();
  const orderId = order.order_id || order.id || 'Order';
  const customer = order.customer || {};
  const deliveryDate = order.deliveryDate || order.required_date || null;
  const total =
    typeof order.total === 'number'
      ? order.total
      : Number(order.total_value ?? 0);

  let cursorY = 20;

  doc.setFontSize(18);
  doc.text('Invoice', 14, cursorY);

  cursorY += 6;
  doc.setFontSize(11);
  doc.text(`Invoice #: ${orderId}`, 14, cursorY);
  cursorY += 5;
  doc.text(`Invoice Date: ${formatDate(new Date().toISOString())}`, 14, cursorY);
  cursorY += 5;
  doc.text(`Order Date: ${formatDate(order.orderDate || order.date)}`, 14, cursorY);
  cursorY += 5;
  doc.text(`Delivery Date: ${formatDate(deliveryDate)}`, 14, cursorY);

  cursorY += 10;
  doc.setFontSize(12);
  doc.text('Bill To:', 14, cursorY);
  cursorY += 5;
  doc.setFontSize(11);
  doc.text(customer.name || '—', 14, cursorY);
  cursorY += 5;
  doc.text(customer.email || '—', 14, cursorY);
  cursorY += 5;
  doc.text(customer.phone || '—', 14, cursorY);
  cursorY += 5;
  doc.text(customer.address?.street || '—', 14, cursorY);
  cursorY += 5;
  doc.text(customer.address?.city || '—', 14, cursorY);

  cursorY += 10;
  doc.setFontSize(12);
  doc.text('Items', 14, cursorY);
  cursorY += 6;
  doc.setFontSize(11);

  doc.line(14, cursorY, 196, cursorY);
  cursorY += 6;
  doc.text('Product', 14, cursorY);
  doc.text('Qty', 90, cursorY);
  doc.text('Price', 120, cursorY);
  doc.text('Total', 160, cursorY);
  cursorY += 4;
  doc.line(14, cursorY, 196, cursorY);
  cursorY += 6;

  order.items.forEach((item) => {
    const lineTotal = item.quantity * item.price;
    doc.text(item.product.name, 14, cursorY);
    doc.text(String(item.quantity), 90, cursorY);
    doc.text(`Rs ${item.price.toFixed(2)}`, 120, cursorY);
    doc.text(`Rs ${lineTotal.toFixed(2)}`, 160, cursorY);
    cursorY += 6;
  });

  cursorY += 4;
  doc.line(120, cursorY, 196, cursorY);
  cursorY += 6;
  doc.setFontSize(12);
  doc.text('Grand Total:', 120, cursorY);
  doc.text(`Rs ${total.toFixed(2)}`, 160, cursorY);

  cursorY += 10;
  doc.setFontSize(10);
  doc.text(
    'Thank you for choosing Kandypack Logistics. For assistance contact support@kandypack.com.',
    14,
    cursorY
  );

  doc.save(`invoice-${orderId}.pdf`);
};
