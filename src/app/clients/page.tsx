"use client";

import React, { useState, useEffect } from 'react';
import styles from './page.module.scss';
import Table from '@/components/ui/Table/Table';
import Badge from '@/components/ui/Badge/Badge';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import { Plus, X } from 'lucide-react';
import { getClientsAction, createClientAction } from '@/app/actions/db';
import { formatCurrency } from '@/lib/insforge';

interface ClientRow {
  id: string;
  name: string;
  email: string;
  activeInvoices: number;
  totalBilled: string;
  status: string;
}

function toRow(c: any): ClientRow {
  const activeInvoices = (c.invoices ?? []).filter(
    (i: any) => i.status === 'pending' || i.status === 'overdue'
  ).length;
  const totalBilled = formatCurrency(
    (c.invoices ?? []).reduce((s: number, i: any) => s + i.total_amount, 0)
  );
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    activeInvoices,
    totalBilled,
    status: c.status,
  };
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    const result = await getClientsAction();
    if (result.success && result.clients) {
      setClients(result.clients.map(toRow));
    }
    setLoading(false);
  }

  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    setError('');

    const formData = new FormData();
    formData.append('name', newName);
    formData.append('email', newEmail);
    formData.append('address', newAddress);

    const result = await createClientAction(formData);
    setAdding(false);

    if (!result.success) {
      setError(result.error || 'Failed to add client');
      return;
    }

    setShowModal(false);
    setNewName('');
    setNewEmail('');
    setNewAddress('');
    loadClients(); // Reload to get everything including empty invoices array
  };

  const handleEdit = (name: string) => {
    alert(`Edit panel opened for ${name}`);
  };

  const columns = [
    { header: "Client Name", accessor: "name" },
    { header: "Contact Email", accessor: "email" },
    { header: "Active Invoices", accessor: "activeInvoices", isNumeric: true },
    { header: "Total Billed", accessor: "totalBilled", isNumeric: true },
    {
      header: "Status",
      accessor: (row: ClientRow) => (
        <Badge status={row.status === 'active' ? 'paid' : 'draft'}>
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      header: "Action",
      accessor: (row: ClientRow) => (
        <Button variant="ghost" onClick={() => handleEdit(row.name)}>Edit</Button>
      )
    }
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Client Management</h1>
          <p className={styles.subtitle}>Manage your client relationships and billing details.</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Client
        </Button>
      </header>

      <section className={styles.tableSection}>
        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', padding: '1rem 0' }}>Loading…</p>
        ) : (
          <Table
            data={clients}
            columns={columns}
            keyExtractor={(row) => row.id}
          />
        )}
      </section>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.modalClose} onClick={() => setShowModal(false)}><X size={20} /></button>
            <h2>Add New Client</h2>
            <form onSubmit={handleAddClientSubmit} className={styles.modalForm}>
              <Input label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} required />
              <Input label="Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
              <Input label="Address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
              {error && <p className={styles.error}>{error}</p>}
              <Button type="submit" disabled={adding}>
                {adding ? 'Adding...' : 'Save Client'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
