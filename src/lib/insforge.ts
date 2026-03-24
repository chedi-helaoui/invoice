import { createClient } from '@insforge/sdk';

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!insforgeUrl || !insforgeAnonKey) {
  throw new Error('Missing InsForge environment variables');
}

export const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeAnonKey
});

/** @deprecated use `insforge` directly */
export function getInsForgeClient() { return insforge }

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Client {
  id: string
  user_id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  client_id: string
  user_id: string
  status: 'paid' | 'pending' | 'overdue' | 'draft'
  issue_date: string
  due_date: string
  subtotal: number
  tax: number
  total_amount: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

export interface InvoiceWithClient extends Invoice {
  clients: { name: string } | null
}

export interface ClientWithInvoices extends Client {
  invoices: Array<{ status: string; total_amount: number }>
}

// ─── Formatters ───────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
