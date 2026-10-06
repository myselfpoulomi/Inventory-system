# Routh Automobile — Inventory & GST Billing Management System

A modern, responsive, complete Inventory & Billing Management desktop/web application designed for **Routh Automobile** spare-parts & workshop business.

## Features
- **Dashboard**: Real-time KPI stats (Products, Stock Value, Low Stock Alerts, Today's Sales/Purchases, Receivables, Payables), 7/30 days sales trends, category valuation charts.
- **GST Billing & Invoice Generator**:
  - Direct automobile bill creation with live stock availability check.
  - Multi-vehicle support (registration number, model, odometer reading).
  - Indian GST calculations (intra-state CGST+SGST vs inter-state IGST, round-off, amount in words).
  - One-click **A4 Print Layout** formatted specifically for printable tax invoices.
- **Product & Inventory Management**:
  - Complete fields: SKU, Barcode, OEM Part No, Brand, Compatibility, Rack Location, Cost/MRP/Selling price, GST %, stock thresholds.
  - CSV Import/Export with downloadable templates.
- **Stock Management & Movements**:
  - Live stock status (In Stock, Low Stock, Out of Stock).
  - Stock adjustment modal (Add, Remove, Audit Correction) with immutable history ledger.
- **Customer & Fleet Management**: Multiple vehicles per customer, purchase history, outstanding receivables.
- **Supplier & Purchase Management**: Inward consignments, vendor payables, automatic stock increment on purchase.
- **Reports & Analytics**: Sales reports, GST return summary (Output vs Input tax credit), stock valuation, profit estimation, outstanding aging.
- **Role-Based Authentication**: Admin (full access) & Staff (billing and sales).
- **Settings & Data**: Business profile, invoice prefix (`RAM/2026/`), terms & conditions, backup/restore JSON.

## Running the Application
```bash
npm start
```
Starts Vite dev server at `http://localhost:5173` and launches Electron desktop window.
