"use client";

import React, { useEffect, useState } from 'react';
import styles from './page.module.scss';
import Table from '@/components/ui/Table/Table';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import Link from 'next/link';
import { formatCurrency, formatDate, type InvoiceWithClient } from '@/lib/insforge';
import { getInvoicesAction } from '@/app/actions/db';

export default function TrackerPage() {
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

  const columns = [
    { header: "Invoice", accessor: "invoice_number" },
    { header: "Client", accessor: (row: InvoiceWithClient) => row.clients?.name ?? '—' },
    { header: "Date Issued", accessor: (row: InvoiceWithClient) => formatDate(row.issue_date) },
    { header: "Due Date", accessor: (row: InvoiceWithClient) => formatDate(row.due_date) },
    { header: "Amount", accessor: (row: InvoiceWithClient) => formatCurrency(row.total_amount), isNumeric: true },
    {
      header: "Status",
      accessor: (row: InvoiceWithClient) => <Badge status={row.status}>{row.status}</Badge>
    },
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
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Invoice Tracker</h1>
          <p className={styles.subtitle}>Monitor the status of all generated invoices.</p>
        </div>
      </header>

      <section className={styles.tableSection}>
        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', padding: '1rem 0' }}>Loading…</p>
        ) : (
          <Table
            data={invoices}
            columns={columns}
            keyExtractor={(row) => row.id}
          />
        )}
      </section>
    </div>
  );
}
