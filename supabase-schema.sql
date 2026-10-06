-- ==============================================================================
-- ROUTH AUTOMOBILE - SUPABASE SQL SCHEMA (CLEAN DATABASE - NO MOCK DATA)
-- SIMPLE CRUD | NO RLS (ROW LEVEL SECURITY DISABLED) | NO AUTHENTICATION NEEDED
-- ==============================================================================
-- HOW TO USE IN SUPABASE:
-- 1. Open your Supabase project (https://supabase.com/dashboard/project/tjebmiewyjptqhnmvsyr/sql/new)
-- 2. Paste this entire script into the SQL Editor
-- 3. Click "Run" (or Ctrl + Enter)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. BUSINESS SETTINGS TABLE (Shop Profile & Invoice Counter)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS settings CASCADE;
CREATE TABLE settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    business_name TEXT DEFAULT 'Routh Automobile',
    tagline TEXT DEFAULT 'Automobile Spare Parts & Services',
    address TEXT DEFAULT 'kanchanpur,khanta.bankura',
    city TEXT DEFAULT 'Bankura',
    state TEXT DEFAULT 'West Bengal',
    state_code TEXT DEFAULT '19',
    pincode TEXT DEFAULT '722133',
    phone TEXT DEFAULT '9641454272',
    email TEXT DEFAULT 'routhautomobiles@gmail.com',
    invoice_prefix TEXT DEFAULT 'RAM/2026/',
    next_invoice_number INT DEFAULT 101,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default shop information for Routh Automobile
INSERT INTO settings (id, business_name, address, phone, email, state, state_code, next_invoice_number)
VALUES ('default', 'Routh Automobile', 'kanchanpur,khanta.bankura', '9641454272', 'routhautomobiles@gmail.com', 'West Bengal', '19', 101)
ON CONFLICT (id) DO UPDATE SET
    business_name = EXCLUDED.business_name,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email;

-- ------------------------------------------------------------------------------
-- 2. PRODUCTS TABLE (Inventory & Spare Parts) - CLEAN TABLE (NO MOCK DATA)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    sku TEXT,
    barcode TEXT,
    category TEXT DEFAULT 'General',
    brand TEXT,
    part_number TEXT,
    vehicle_compatibility TEXT,
    unit TEXT DEFAULT 'PCS',
    purchase_price NUMERIC(12, 2) DEFAULT 0,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    mrp NUMERIC(12, 2) DEFAULT 0,
    gst_percent NUMERIC(5, 2) DEFAULT 18,
    current_quantity NUMERIC(10, 2) DEFAULT 0,
    min_stock_level NUMERIC(10, 2) DEFAULT 5,
    location_rack TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 3. CUSTOMERS TABLE (Customer Directory) - CLEAN TABLE (NO MOCK DATA)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS customers CASCADE;
CREATE TABLE customers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    vehicle_number TEXT,
    vehicle_model TEXT,
    gstin TEXT,
    state TEXT DEFAULT 'West Bengal',
    state_code TEXT DEFAULT '19',
    outstanding_balance NUMERIC(12, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. INVOICES TABLE (Bills & Counter Sales) - CLEAN TABLE (NO MOCK DATA)
-- Line items stored directly in `items` JSONB for 1-query saving & reading
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS invoices CASCADE;
CREATE TABLE invoices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    invoice_number TEXT UNIQUE NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    due_date TIMESTAMPTZ DEFAULT NOW(),
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_address TEXT,
    customer_gstin TEXT,
    vehicle_number TEXT,
    vehicle_model TEXT,
    odometer_km TEXT,
    items JSONB DEFAULT '[]'::JSONB,
    subtotal NUMERIC(12, 2) DEFAULT 0,
    total_discount NUMERIC(12, 2) DEFAULT 0,
    taxable_amount NUMERIC(12, 2) DEFAULT 0,
    cgst NUMERIC(12, 2) DEFAULT 0,
    sgst NUMERIC(12, 2) DEFAULT 0,
    igst NUMERIC(12, 2) DEFAULT 0,
    total_tax NUMERIC(12, 2) DEFAULT 0,
    round_off NUMERIC(12, 2) DEFAULT 0,
    grand_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(12, 2) DEFAULT 0,
    balance_due NUMERIC(12, 2) DEFAULT 0,
    payment_mode TEXT DEFAULT 'Cash',
    payment_reference TEXT,
    payment_status TEXT DEFAULT 'PAID',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. DISABLE ROW LEVEL SECURITY (NO RLS - ZERO BLOCKERS)
-- ------------------------------------------------------------------------------
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;

-- If Supabase forces RLS enabled on table level, these permissive policies guarantee 100% access:
DROP POLICY IF EXISTS "Public full access" ON settings;
CREATE POLICY "Public full access" ON settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON products;
CREATE POLICY "Public full access" ON products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON customers;
CREATE POLICY "Public full access" ON customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access" ON invoices;
CREATE POLICY "Public full access" ON invoices FOR ALL USING (true) WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 6. GRANT ALL PERMISSIONS TO PUBLIC ANON & AUTHENTICATED ROLES
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
