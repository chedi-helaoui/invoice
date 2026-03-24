"use client";

import React, { useState, useEffect } from 'react';
import styles from './page.module.scss';
import Input from '@/components/ui/Input/Input';
import Button from '@/components/ui/Button/Button';
import { ArrowLeft, Save, Send } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createInvoiceAction, getNextInvoiceNumberAction } from '@/app/actions/db';

export default function CreateInvoicePage() {
  const router = useRouter();

  const [items, setItems] = useState([{ id: 1, desc: '', qty: 1, rate: 0 }]);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function generateNumber() {
      const nextNum = await getNextInvoiceNumberAction();
      setInvoiceNumber(nextNum);
    }
    generateNumber();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), desc: '', qty: 1, rate: 0 }]);
  };

  const handleUpdateItem = (id: number, field: string, value: string | number) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const calculateSubtotal = (qty: number, rate: number) => (qty * rate).toFixed(2);

  async function saveInvoice(status: 'draft' | 'pending') {
    if (saving) return;
    setSaving(true);

    if (!clientEmail.trim()) {
      alert("Please provide the Client Email address.");
      setSaving(false);
      return;
    }

    const payload = {
      clientName,
      clientEmail,
      clientAddress,
      invoiceNumber,
      issueDate,
      dueDate,
      status,
      items
    };

    const result = await createInvoiceAction(payload);
    
    if (!result.success) {
      alert(result.error || 'Failed to save invoice.');
      setSaving(false);
      return;
    }

    setSaving(false);
    router.push('/tracker');
  }

  const handleSaveDraft = () => saveInvoice('draft');
  const handleGenerate = () => saveInvoice('pending');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <Link href="/tracker" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Invoices
          </Link>
          <h1 className={styles.title}>New Invoice</h1>
          <p className={styles.subtitle}>Create and send a new invoice.</p>
        </div>
        <div className={styles.headerActions}>
          <Button variant="secondary" onClick={handleSaveDraft} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button onClick={handleGenerate} disabled={saving}>
            <Send size={16} /> {saving ? 'Generating...' : 'Generate Invoice'}
          </Button>
        </div>
      </header>

      <div className={styles.formGrid}>
        <section className={styles.sectionCard}>
          <h2>Client Details</h2>
          <div className={styles.inputGroup}>
            <Input
              label="Client Name"
              placeholder="e.g. Acme Corp"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <Input
              label="Email Address"
              placeholder="billing@acmecorp.com"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
          <Input
            label="Billing Address"
            placeholder="123 Corporate Blvd"
            value={clientAddress}
            onChange={(e) => setClientAddress(e.target.value)}
          />
        </section>

        <section className={styles.sectionCard}>
          <h2>Invoice Details</h2>
          <div className={styles.inputGroup}>
            <Input
              label="Invoice Number"
              placeholder="INV-001"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
            <Input
              label="Date Issued"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </section>

        <section className={styles.sectionCard}>
          <h2>Line Items</h2>
          <div className={styles.lineItemHeader}>
            <span>Description</span>
            <span>Qty</span>
            <span>Rate</span>
            <span>Subtotal</span>
          </div>
          {items.map((item) => (
            <div key={item.id} className={styles.lineItemRow}>
              <Input
                placeholder="Service Description"
                value={item.desc}
                onChange={(e) => handleUpdateItem(item.id, 'desc', e.target.value)}
              />
              <Input
                placeholder="1"
                type="number"
                value={item.qty}
                onChange={(e) => handleUpdateItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
              />
              <Input
                placeholder="0.00"
                type="number"
                value={item.rate}
                onChange={(e) => handleUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
              />
              <div className={styles.subtotal}>${calculateSubtotal(item.qty, item.rate)}</div>
            </div>
          ))}
          <Button variant="ghost" className={styles.addItemBtn} onClick={handleAddItem} type="button">+ Add Item</Button>
        </section>
      </div>
    </div>
  );
}
