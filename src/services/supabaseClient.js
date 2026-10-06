/**
 * Supabase Client Configuration & Complete CRUD Service for Routh Automobile
 * 
 * Works seamlessly with Supabase REST API (No RLS, No Auth required)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==============================================================================
// DATA MAPPERS (camelCase Frontend <--> snake_case PostgreSQL)
// ==============================================================================

export function toProductRow(p) {
  return {
    id: p.id,
    name: p.name,
    sku: p.sku || '',
    barcode: p.barcode || '',
    category: p.category || '',
    brand: p.brand || '',
    part_number: p.partNumber || p.part_number || '',
    vehicle_compatibility: p.vehicleCompatibility || p.vehicle_compatibility || '',
    unit: p.unit || 'PCS',
    purchase_price: Number(p.purchasePrice ?? p.purchase_price ?? 0),
    selling_price: Number(p.sellingPrice ?? p.selling_price ?? 0),
    mrp: Number(p.mrp ?? 0),
    gst_percent: Number(p.gstPercent ?? p.gst_percent ?? 18),
    current_quantity: Number(p.currentQuantity ?? p.current_quantity ?? 0),
    min_stock_level: Number(p.minStockLevel ?? p.min_stock_level ?? 5),
    location_rack: p.locationRack || p.location_rack || '',
    description: p.description || '',
    is_active: p.isActive !== false,
  };
}

export function fromProductRow(row) {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku || '',
    barcode: row.barcode || '',
    category: row.category || 'General',
    brand: row.brand || '',
    partNumber: row.part_number || '',
    vehicleCompatibility: row.vehicle_compatibility || '',
    unit: row.unit || 'PCS',
    purchasePrice: Number(row.purchase_price || 0),
    sellingPrice: Number(row.selling_price || 0),
    mrp: Number(row.mrp || 0),
    gstPercent: Number(row.gst_percent || 18),
    currentQuantity: Number(row.current_quantity || 0),
    minStockLevel: Number(row.min_stock_level || 5),
    locationRack: row.location_rack || '',
    description: row.description || '',
    isActive: row.is_active !== false,
  };
}

export function toCustomerRow(c) {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone || '',
    email: c.email || '',
    address: c.address || '',
    vehicle_number: c.vehicleNumber || c.vehicle_number || (c.vehicles?.[0]?.vehicleNumber) || '',
    vehicle_model: c.vehicleModel || c.vehicle_model || (c.vehicles?.[0]?.makeModel) || '',
    gstin: c.gstin || '',
    state: c.state || 'West Bengal',
    state_code: c.stateCode || c.state_code || '19',
    outstanding_balance: Number(c.outstandingBalance ?? c.outstanding_balance ?? 0),
    notes: c.notes || '',
  };
}

export function fromCustomerRow(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    address: row.address || '',
    gstin: row.gstin || '',
    state: row.state || 'West Bengal',
    stateCode: row.state_code || '19',
    outstandingBalance: Number(row.outstanding_balance || 0),
    notes: row.notes || '',
    vehicles: row.vehicle_number ? [{
      vehicleNumber: row.vehicle_number,
      makeModel: row.vehicle_model || 'Vehicle'
    }] : []
  };
}

export function toInvoiceRow(inv) {
  return {
    id: inv.id,
    invoice_number: inv.invoiceNumber || inv.invoice_number,
    date: inv.date || new Date().toISOString(),
    due_date: inv.dueDate || inv.due_date || new Date().toISOString(),
    customer_id: inv.customerId || inv.customer_id || null,
    customer_name: inv.customerName || inv.customer_name || 'Counter Sale',
    customer_phone: inv.customerPhone || inv.customer_phone || '',
    customer_address: inv.customerAddress || inv.customer_address || '',
    customer_gstin: inv.customerGstin || inv.customer_gstin || '',
    vehicle_number: inv.vehicleNumber || inv.vehicle_number || '',
    vehicle_model: inv.vehicleModel || inv.vehicle_model || '',
    odometer_km: inv.odometerKm || inv.odometer_km || '',
    items: Array.isArray(inv.items) ? inv.items : [],
    subtotal: Number(inv.subtotal || 0),
    total_discount: Number(inv.totalDiscount ?? inv.total_discount ?? 0),
    taxable_amount: Number(inv.taxableAmount ?? inv.taxable_amount ?? 0),
    cgst: Number(inv.cgst || 0),
    sgst: Number(inv.sgst || 0),
    igst: Number(inv.igst || 0),
    total_tax: Number(inv.totalTax ?? inv.total_tax ?? 0),
    round_off: Number(inv.roundOff ?? inv.round_off ?? 0),
    grand_total: Number(inv.grandTotal ?? inv.grand_total ?? 0),
    paid_amount: Number(inv.paidAmount ?? inv.paid_amount ?? 0),
    balance_due: Number(inv.balanceDue ?? inv.balance_due ?? 0),
    payment_mode: inv.paymentMode || inv.payment_mode || 'Cash',
    payment_reference: inv.paymentReference || inv.payment_reference || '',
    payment_status: inv.paymentStatus || inv.payment_status || 'PAID',
    notes: inv.notes || '',
  };
}

export function fromInvoiceRow(row) {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    date: row.date,
    dueDate: row.due_date,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone || '',
    customerAddress: row.customer_address || '',
    customerGstin: row.customer_gstin || '',
    vehicleNumber: row.vehicle_number || '',
    vehicleModel: row.vehicle_model || '',
    odometerKm: row.odometer_km || '',
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal || 0),
    totalDiscount: Number(row.total_discount || 0),
    taxableAmount: Number(row.taxable_amount || 0),
    cgst: Number(row.cgst || 0),
    sgst: Number(row.sgst || 0),
    igst: Number(row.igst || 0),
    totalTax: Number(row.total_tax || 0),
    roundOff: Number(row.round_off || 0),
    grandTotal: Number(row.grand_total || 0),
    paidAmount: Number(row.paid_amount || 0),
    balanceDue: Number(row.balance_due || 0),
    paymentMode: row.payment_mode || 'Cash',
    paymentReference: row.payment_reference || '',
    paymentStatus: row.payment_status || 'PAID',
    notes: row.notes || '',
  };
}

export function toSettingsRow(s) {
  return {
    id: 'default',
    business_name: s.businessName || s.business_name || 'Routh Automobile',
    tagline: s.tagline || 'Automobile Spare Parts & Services',
    address: s.address || 'kanchanpur,khanta.bankura',
    city: s.city || 'Bankura',
    state: s.state || 'West Bengal',
    state_code: s.stateCode || s.state_code || '19',
    pincode: s.pincode || '722133',
    phone: s.phone || '9641454272',
    email: s.email || 'routhautomobiles@gmail.com',
    invoice_prefix: s.invoicePrefix || s.invoice_prefix || 'RAM/2026/',
    next_invoice_number: Number(s.nextInvoiceNumber || s.next_invoice_number || 106),
  };
}

export function fromSettingsRow(row) {
  return {
    id: row.id || 'default',
    businessName: row.business_name || 'Routh Automobile',
    tagline: row.tagline || 'Automobile Spare Parts & Services',
    address: row.address || 'kanchanpur,khanta.bankura',
    city: row.city || 'Bankura',
    state: row.state || 'West Bengal',
    stateCode: row.state_code || '19',
    pincode: row.pincode || '722133',
    phone: row.phone || '9641454272',
    email: row.email || 'routhautomobiles@gmail.com',
    invoicePrefix: row.invoice_prefix || 'RAM/2026/',
    nextInvoiceNumber: Number(row.next_invoice_number || 106),
  };
}

// ==============================================================================
// CRUD API METHODS
// ==============================================================================

export const api = {
  // --- PRODUCTS (INVENTORY) ---
  products: {
    getAll: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(fromProductRow);
    },
    create: async (product) => {
      if (!supabase) return null;
      const row = toProductRow(product);
      const { data, error } = await supabase.from('products').insert([row]).select().single();
      if (error) throw error;
      return fromProductRow(data);
    },
    update: async (id, updates) => {
      if (!supabase) return null;
      const row = toProductRow({ id, ...updates });
      const { data, error } = await supabase.from('products').update(row).eq('id', id).select().single();
      if (error) throw error;
      return fromProductRow(data);
    },
    delete: async (id) => {
      if (!supabase) return null;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  // --- CUSTOMERS ---
  customers: {
    getAll: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(fromCustomerRow);
    },
    create: async (customer) => {
      if (!supabase) return null;
      const row = toCustomerRow(customer);
      const { data, error } = await supabase.from('customers').insert([row]).select().single();
      if (error) throw error;
      return fromCustomerRow(data);
    },
    update: async (id, updates) => {
      if (!supabase) return null;
      const row = toCustomerRow({ id, ...updates });
      const { data, error } = await supabase.from('customers').update(row).eq('id', id).select().single();
      if (error) throw error;
      return fromCustomerRow(data);
    },
    delete: async (id) => {
      if (!supabase) return null;
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  // --- INVOICES (BILLS) ---
  invoices: {
    getAll: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(fromInvoiceRow);
    },
    create: async (invoice) => {
      if (!supabase) return null;
      const row = toInvoiceRow(invoice);
      const { data, error } = await supabase.from('invoices').insert([row]).select().single();
      if (error) throw error;
      return fromInvoiceRow(data);
    },
    delete: async (id) => {
      if (!supabase) return null;
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  // --- SETTINGS ---
  settings: {
    get: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase.from('settings').select('*').eq('id', 'default').maybeSingle();
      if (error) throw error;
      return data ? fromSettingsRow(data) : null;
    },
    update: async (updates) => {
      if (!supabase) return null;
      const row = toSettingsRow(updates);
      const { data, error } = await supabase.from('settings').upsert(row).select().single();
      if (error) throw error;
      return fromSettingsRow(data);
    }
  }
};
