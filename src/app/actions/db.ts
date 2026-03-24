'use server'

import { createInsForgeServerClient, getAccessToken } from '@/lib/insforge-server'

export async function getClientsAction() {
  const token = await getAccessToken()
  const insforge = createInsForgeServerClient(token)
  const { data, error } = await insforge.database
    .from('clients')
    .select('*, invoices(status, total_amount)')
    .order('created_at', { ascending: false })
  
  if (error) return { success: false, error: error.message }
  return { success: true, clients: data }
}

export async function createClientAction(formData: FormData) {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const address = String(formData.get('address') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()

  const token = await getAccessToken()
  const insforge = createInsForgeServerClient(token)
  
  const { data, error } = await insforge.database
    .from('clients')
    .insert([{
      name: name || 'Unknown Client',
      email,
      address: address || null,
      phone: phone || null,
      status: 'active'
    }])
    .select('*')
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, client: data }
}

export async function createInvoiceAction(payload: any) {
  try {
  const token = await getAccessToken()
  const insforge = createInsForgeServerClient(token)
  
  let clientId = payload.clientId;

  if (!clientId && payload.clientEmail) {
    const { data: existing } = await insforge.database
      .from('clients')
      .select('id')
      .eq('email', payload.clientEmail.trim())
      .maybeSingle()
      
    if (existing) {
      clientId = existing.id
    } else {
      const { data: created, error } = await insforge.database
        .from('clients')
        .insert([{
          name: payload.clientName.trim() || 'Unknown Client',
          email: payload.clientEmail.trim(),
          address: payload.clientAddress?.trim() || null,
          status: 'active'
        }])
        .select('id')
        .single()
        
      if (error || !created) return { success: false, error: 'Failed to create client.' }
      clientId = created.id
    }
  }

  if (!clientId) return { success: false, error: 'Client ID missing or failed to verify client email.' }

  const subtotal = payload.items.reduce((acc: number, item: any) => acc + (item.qty * item.rate), 0)
  
  const { data: invoice, error: invoiceError } = await insforge.database
    .from('invoices')
    .insert([{
      invoice_number: payload.invoiceNumber,
      client_id: clientId,
      status: payload.status,
      issue_date: payload.issueDate || new Date().toISOString().split('T')[0],
      due_date: payload.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      subtotal,
      tax: 0,
      total_amount: subtotal
    }])
    .select('id')
    .single()
    
  if (invoiceError || !invoice) return { success: false, error: invoiceError?.message || 'Failed to create invoice.' }

  const lineItems = payload.items
    .filter((i: any) => i.desc.trim())
    .map((i: any) => ({
      invoice_id: invoice.id,
      description: i.desc,
      quantity: i.qty,
      rate: i.rate,
      amount: i.qty * i.rate
    }))

  if (lineItems.length > 0) {
    const { error: itemsError } = await insforge.database.from('invoice_items').insert(lineItems)
    if (itemsError) return { success: false, error: itemsError.message }
  }

  return { success: true, invoiceId: invoice.id }
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Unexpected error creating invoice.' }
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface UserSettings {
  company_name: string
  vat_number: string
  business_address: string
  logo_url: string | null
  default_currency: string
  default_tax_rate: number
  payment_terms: string
  notify_overdue: boolean
  notify_paid: boolean
  notify_weekly_summary: boolean
}

export async function getSettingsAction() {
  try {
    const token = await getAccessToken()
    const insforge = createInsForgeServerClient(token)
    const { data, error } = await insforge.database
      .from('user_settings')
      .select('*')
      .maybeSingle()

    if (error) return { success: false as const, error: error.message }
    return { success: true as const, settings: data as UserSettings | null }
  } catch (err: any) {
    return { success: false as const, error: err?.message ?? 'Failed to fetch settings.' }
  }
}

export async function saveSettingsAction(settings: UserSettings) {
  try {
    const token = await getAccessToken()
    const insforge = createInsForgeServerClient(token)

    // Try update first, insert if no row exists yet
    const { data: existing } = await insforge.database
      .from('user_settings')
      .select('id')
      .maybeSingle()

    if (existing) {
      const { error } = await insforge.database
        .from('user_settings')
        .update(settings)
        .eq('id', existing.id)
      if (error) return { success: false as const, error: error.message }
    } else {
      const { error } = await insforge.database
        .from('user_settings')
        .insert([settings])
      if (error) return { success: false as const, error: error.message }
    }

    return { success: true as const }
  } catch (err: any) {
    return { success: false as const, error: err?.message ?? 'Failed to save settings.' }
  }
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function getInvoicesAction() {
  try {
    const token = await getAccessToken()
    const insforge = createInsForgeServerClient(token)
    const { data, error } = await insforge.database
      .from('invoices')
      .select('*, clients(name)')
      .order('created_at', { ascending: false })

    if (error) return { success: false as const, error: error.message }
    return { success: true as const, invoices: data ?? [] }
  } catch (err: any) {
    return { success: false as const, error: err?.message ?? 'Failed to fetch invoices.' }
  }
}

export async function getInvoiceByIdAction(id: string) {
  try {
    const token = await getAccessToken()
    const insforge = createInsForgeServerClient(token)
    const { data, error } = await insforge.database
      .from('invoices')
      .select('*, clients(*), invoice_items(*)')
      .eq('id', id)
      .maybeSingle()

    if (error) return { success: false as const, error: error.message }
    return { success: true as const, invoice: data }
  } catch (err: any) {
    return { success: false as const, error: err?.message ?? 'Failed to fetch invoice.' }
  }
}

export async function getNextInvoiceNumberAction() {
  try {
    const token = await getAccessToken()
    const insforge = createInsForgeServerClient(token)
    const { data } = await insforge.database
      .from('invoices')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(1000)

    const next = (data?.length ?? 0) + 1
    return `INV-${String(next).padStart(3, '0')}`
  } catch {
    return 'INV-001'
  }
}
