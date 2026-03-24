"use client";

import React, { useEffect, useState } from 'react';
import styles from './page.module.scss';
import Button from '@/components/ui/Button/Button';
import Badge from '@/components/ui/Badge/Badge';
import { ArrowLeft, Download, Send } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate, type Invoice, type InvoiceItem, type Client } from '@/lib/insforge';
import { getInvoiceByIdAction } from '@/app/actions/db';

interface FullInvoice extends Invoice {
  clients: Client | null;
  invoice_items: InvoiceItem[];
}

export default function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: invoiceId } = React.use(params);
  const [invoice, setInvoice] = useState<FullInvoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getInvoiceByIdAction(invoiceId);
      if (result.success && result.invoice) setInvoice(result.invoice as FullInvoice);
      setLoading(false);
    }
    load();
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  const handleSend = () => {
    alert(`Invoice ${invoice?.invoice_number ?? invoiceId} has been securely emailed to the client!`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <p style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Loading invoice…</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className={styles.container}>
        <p style={{ color: 'rgba(255,255,255,0.4)', padding: '2rem' }}>Invoice not found.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/tracker" className={styles.backLink}>
            <ArrowLeft size={16} /> Back
          </Link>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Invoice {invoice.invoice_number}</h1>
            <Badge status={invoice.status}>{invoice.status}</Badge>
          </div>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={handlePrint}><Download size={16} /> Download PDF</Button>
          <Button onClick={handleSend}><Send size={16} /> Send to Client</Button>
        </div>
      </header>

      {/* The Paper Sheet / Preview Pane */}
      <div className={styles.paper}>
        <div className={styles.paperHeader}>
          <div className={styles.companyInfo}>
            <div className={styles.logoMark} />
            <div className={styles.companyDetails}>
              <strong>The Fiscal Atelier</strong>
              <span>123 Design Blvd, Studio 404</span>
              <span>New York, NY 10001</span>
            </div>
          </div>
          <div className={styles.invoiceMeta}>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Invoice Number</span>
              <span className={styles.metaValue}>{invoice.invoice_number}</span>
            </div>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Date Issued</span>
              <span className={styles.metaValue}>{formatDate(invoice.issue_date)}</span>
            </div>
            <div className={styles.metaBlock}>
              <span className={styles.metaLabel}>Due Date</span>
              <span className={styles.metaValue}>{formatDate(invoice.due_date)}</span>
            </div>
          </div>
        </div>

        <div className={styles.billTo}>
          <span className={styles.metaLabel}>Billed To</span>
          <strong>{invoice.clients?.name ?? 'Unknown Client'}</strong>
          {invoice.clients?.address && <span>{invoice.clients.address}</span>}
          {invoice.clients?.email && <span>{invoice.clients.email}</span>}
        </div>

        <table className={styles.invoiceTable}>
          <thead>
            <tr>
              <th>Description</th>
              <th className={styles.rightAlign}>Qty</th>
              <th className={styles.rightAlign}>Rate</th>
              <th className={styles.rightAlign}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.invoice_items.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td className={styles.rightAlign}>{item.quantity}</td>
                <td className={styles.rightAlign}>{formatCurrency(item.rate)}</td>
                <td className={styles.rightAlign}>{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className={styles.totals}>
          <div className={styles.totalRow}>
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Tax ({invoice.tax}%)</span>
            <span>{formatCurrency((invoice.subtotal * invoice.tax) / 100)}</span>
          </div>
          <div className={styles.grandTotal}>
            <span>Total Due</span>
            <span>{formatCurrency(invoice.total_amount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
