/**
 * Initial Business Settings & Real Data Schema for Routh Automobile
 * All dummy/hardcoded data has been completely removed.
 * Data is dynamically fetched and stored in Supabase backend.
 */

export const INITIAL_BUSINESS_SETTINGS = {
  businessName: 'Routh Automobile',
  tagline: 'Automobile Spare Parts & Services',
  address: 'kanchanpur,khanta.bankura',
  city: 'Bankura',
  state: 'West Bengal',
  stateCode: '19',
  pincode: '722133',
  phone: '9641454272',
  email: 'routhautomobiles@gmail.com',
  gstin: '',
  pan: '',
  invoicePrefix: 'RAM/2026/',
  nextInvoiceNumber: 101,
  purchasePrefix: 'PO-2026/',
  nextPurchaseNumber: 1,
  allowNegativeStock: true,
  showVehicleDetails: true,
  showPartNumber: true,
  isGstInclusive: false,
  termsAndConditions: [
    'Goods once sold cannot be returned without bill.',
    'Warranty as per manufacturer terms only.'
  ],
  invoiceFooterNote: 'Thank you for choosing Routh Automobile!'
};

export const INITIAL_USERS = [
  {
    id: 'usr-admin',
    name: 'Admin',
    email: 'admin@routhautomobile.com',
    role: 'admin',
    phone: '9641454272',
    title: 'Administrator'
  },
  {
    id: 'usr-user',
    name: 'User',
    email: 'user@routhautomobile.com',
    role: 'user',
    phone: '9641454272',
    title: 'Billing User'
  }
];

export const INITIAL_CATEGORIES = [
  'Brake Parts',
  'Engine Parts',
  'Lubricants',
  'Filters',
  'Clutch & Transmission',
  'Electrical',
  'Suspension',
  'Accessories'
];

export const INITIAL_BRANDS = [
  'Bosch',
  'Castrol',
  'Purolator',
  'Valeo',
  'Uno Minda',
  'Mobil',
  'Exide',
  'Lumax'
];

// All hardcoded mock collections emptied - driven by backend database
export const INITIAL_SUPPLIERS = [];
export const INITIAL_CUSTOMERS = [];
export const INITIAL_PRODUCTS = [];
export const INITIAL_INVOICES = [];
export const INITIAL_PURCHASES = [];
export const INITIAL_STOCK_MOVEMENTS = [];
export const INITIAL_PAYMENTS = [];
