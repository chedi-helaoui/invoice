"use client";

import React, { useEffect, useState } from 'react';
import styles from './page.module.scss';
import SummaryCard from '@/components/ui/SummaryCard/SummaryCard';
import { DollarSign, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Table from '@/components/ui/Table/Table';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import Link from 'next/link';
import { formatCurrency, formatDate, type InvoiceWithClient } from '@/lib/insforge';
import { getInvoicesAction } from '@/app/actions/db';

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getInvoicesAction();
      if (result.success) setInvoices(result.invoices as InvoiceWithClient[]);
      setLoading(false);
    }
    load();
  }, []);

  const now = new Date();
  const thisMonth = (d: string) => {
    const date = new Date(d);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total_amount, 0);
  const outstanding = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + i.total_amount, 0);
  const invoicesSent = invoices.filter((i) => thisMonth(i.issue_date)).length;
  const paidInvoices = invoices.filter((i) => i.status === 'paid' && thisMonth(i.issue_date)).length;

  const summaryData = [
    { title: "Total Revenue", value: formatCurrency(totalRevenue), trend: "+12.5%", positive: true, Icon: DollarSign },
    { title: "Outstanding", value: formatCurrency(outstanding), trend: "-5.2%", positive: false, Icon: AlertCircle },
    { title: "Invoices Sent", value: String(invoicesSent), trend: "This month", positive: true, Icon: FileText },
    { title: "Paid Invoices", value: String(paidInvoices), trend: "This month", positive: true, Icon: CheckCircle },
  ];

  const recentInvoices = invoices.slice(0, 5);

  const columns = [
    { header: "Invoice", accessor: "invoice_number" },
    { header: "Client", accessor: (row: InvoiceWithClient) => row.clients?.name ?? '—' },
    { header: "Date", accessor: (row: InvoiceWithClient) => formatDate(row.issue_date) },
    {
      header: "Status",
      accessor: (row: InvoiceWithClient) => <Badge status={row.status}>{row.status}</Badge>
    },
    { header: "Amount", accessor: (row: InvoiceWithClient) => formatCurrency(row.total_amount), isNumeric: true },
    {
      header: "Action",
      accessor: (row: InvoiceWithClient) => (
        <Link href={`/preview/${row.id}`}>
          <Button variant="ghost">View</Button>
        </Link>
      )
    }
  ];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Overview</h1>
          <p className={styles.subtitle}>Welcome back. Here's what's happening today.</p>
        </div>
        <Link href="/create">
          <Button>Create Invoice</Button>
        </Link>
      </header>

      <section className={styles.summaryGrid}>
        {summaryData.map((item, index) => (
          <SummaryCard key={index} {...item} />
        ))}
      </section>

      <section className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2>Recent Invoices</h2>
          <Link href="/tracker">
            <Button variant="secondary">View All</Button>
          </Link>
        </div>
        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', padding: '1rem 0' }}>Loading…</p>
        ) : (
          <Table
            data={recentInvoices}
            columns={columns}
            keyExtractor={(row) => row.id}
          />
        )}
      </section>
    </div>
  );
}
