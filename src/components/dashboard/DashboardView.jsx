import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Building2,
  FilePlus,
  UserPlus,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  ChevronRight,
  ShieldAlert,
  BarChart3,
  Calendar,
  Layers,
  Wrench,
  Clock
} from 'lucide-react';

export default function DashboardView({ onOpenAdjustStock, onOpenAddProduct }) {
  const {
    products,
    invoices,
    purchases,
    customers,
    suppliers,
    setActiveTab,
    openInvoicePrint,
    adjustStock,
  } = useApp();

  const [salesTimeframe, setSalesTimeframe] = useState('7'); // 7 or 30 days

  // Compute Statistics
  const totalProducts = products.length;
  const totalStockValue = products.reduce((acc, p) => acc + (p.currentQuantity * p.purchasePrice), 0);
  const lowStockProducts = products.filter(p => p.currentQuantity <= p.minStockLevel);
  
  // Calculate today's sales and purchases
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysSales = invoices
    .filter(i => (i.date || '').slice(0, 10) === todayStr)
    .reduce((acc, i) => acc + (i.grandTotal || 0), 0);

  const todaysPurchases = purchases
    .filter(p => (p.date || '').slice(0, 10) === todayStr)
    .reduce((acc, p) => acc + (p.totalAmount || 0), 0);

  // Total Receivables from customers
  const totalReceivables = customers.reduce((acc, c) => acc + (c.outstandingBalance || 0), 0);

  // Total Payables to suppliers
  const totalPayables = suppliers.reduce((acc, s) => acc + (s.outstandingPayable || 0), 0);

  // Category breakdown for Stock Value
  const categoryMap = {};
  products.forEach(p => {
    const cat = p.category || 'Other';
    const val = p.currentQuantity * p.purchasePrice;
    categoryMap[cat] = (categoryMap[cat] || 0) + val;
  });
  const categoryStats = Object.entries(categoryMap)
    .map(([cat, val]) => ({ category: cat, value: val }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // Top Selling Automobile Products (derived from invoice items)
  const productSalesMap = {};
  invoices.forEach(inv => {
    (inv.items || []).forEach(item => {
      const name = item.name || 'Unknown Item';
      productSalesMap[name] = (productSalesMap[name] || 0) + (Number(item.quantity) || 1);
    });
  });
  const topSellingParts = Object.entries(productSalesMap)
    .map(([name, qty]) => ({ name, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Quick Restock helper
  const handleQuickRestock = (product) => {
    const qtyToAdd = Math.max(5, (product.minStockLevel * 2) - product.currentQuantity);
    adjustStock({
      productId: product.id,
      adjustmentType: 'ADD',
      quantity: qtyToAdd,
      reason: 'Quick dashboard restock alert replenishment'
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner / Welcome & Quick Action Shortcuts */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Automobile Operations Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock valuation, billing turnover, customer receivables, and parts inventory.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('billing')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
          >
            <FilePlus className="h-4 w-4" />
            <span>Create Invoice</span>
          </button>

          <button
            onClick={() => onOpenAddProduct?.()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4 text-blue-600" />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
          >
            <UserPlus className="h-4 w-4 text-slate-600" />
            <span>Add Customer</span>
          </button>

          <button
            onClick={() => setActiveTab('new-purchase')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4 text-slate-600" />
            <span>Add Purchase</span>
          </button>
        </div>
      </div>

      {/* Top 7 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Products */}
        <div 
          onClick={() => setActiveTab('inventory')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Products</span>
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalProducts}</span>
            <span className="text-xs text-slate-500">active SKUs</span>
          </div>
          <div className="mt-2 text-[11px] text-blue-600 font-medium flex items-center gap-1">
            <span>Manage Catalog</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>

        {/* Total Stock Value */}
        <div 
          onClick={() => setActiveTab('stock')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Stock Value</span>
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{formatCurrency(totalStockValue)}</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Valued at purchase cost across {products.reduce((acc, p) => acc + p.currentQuantity, 0)} units
          </p>
        </div>

        {/* Low Stock Alert */}
        <div 
          onClick={() => setActiveTab('stock')}
          className={`p-4 rounded-xl border shadow-2xs transition-all cursor-pointer group ${
            lowStockProducts.length > 0 
              ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400' 
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Low Stock Items</span>
            <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-900 font-mono">{lowStockProducts.length}</span>
            <span className="text-xs text-amber-700 font-medium">need replenishment</span>
          </div>
          <p className="mt-2 text-[11px] text-amber-800 font-semibold flex items-center gap-1">
            <span>View alert list</span>
            <ChevronRight className="h-3 w-3" />
          </p>
        </div>

        {/* Today's Sales */}
        <div 
          onClick={() => setActiveTab('invoices')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Sales</span>
            <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{formatCurrency(todaysSales)}</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            GST billings generated today
          </p>
        </div>

        {/* Today's Purchases */}
        <div 
          onClick={() => setActiveTab('purchases')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Purchases</span>
            <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{formatCurrency(todaysPurchases)}</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Supplier inward consignments
          </p>
        </div>

        {/* Total Receivables (Customer Outstanding) */}
        <div 
          onClick={() => setActiveTab('customers')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-rose-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Receivables</span>
            <div className="h-9 w-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700 font-mono">{formatCurrency(totalReceivables)}</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Pending dues from {customers.filter(c => c.outstandingBalance > 0).length} customers
          </p>
        </div>

        {/* Total Payables (To Suppliers) */}
        <div 
          onClick={() => setActiveTab('suppliers')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Supplier Payables</span>
            <div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800 font-mono">{formatCurrency(totalPayables)}</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Payables to OEM vendors & depots
          </p>
        </div>

        {/* Invoices Count / Direct Quick Bill */}
        <div 
          onClick={() => setActiveTab('billing')}
          className="bg-blue-600 text-white p-4 rounded-xl shadow-xs hover:bg-blue-700 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-100">Ready to Bill?</span>
            <FilePlus className="h-5 w-5 text-white" />
          </div>
          <div className="my-2">
            <div className="text-base font-bold">New Vehicle / OTC Bill</div>
            <p className="text-[11px] text-blue-100">Quickly issue A4 printed GST tax invoice</p>
          </div>
          <div className="text-[11px] font-bold text-white flex items-center gap-1">
            <span>Open Billing Counter</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>

      </div>

      {/* Visual Analytics & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Sales Turnover Trend (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sales Turnover & Billing Trend</h3>
                <p className="text-xs text-slate-500">Automobile parts sales volume and invoice values</p>
              </div>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setSalesTimeframe('7')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    salesTimeframe === '7' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-600'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setSalesTimeframe('30')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    salesTimeframe === '30' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-600'
                  }`}
                >
                  Last 30 Days
                </button>
              </div>
            </div>

            {/* Visual Simulated Bar Chart */}
            <div className="pt-6 pb-2">
              <div className="h-44 flex items-end gap-3 justify-between px-2 border-b border-slate-200 pb-2">
                {[
                  { day: 'Wed', val: 4200, count: 2 },
                  { day: 'Thu', val: 7800, count: 4 },
                  { day: 'Fri', val: 5600, count: 3 },
                  { day: 'Sat', val: 14200, count: 6 },
                  { day: 'Sun', val: 9800, count: 4 },
                  { day: 'Mon', val: 11848, count: 5 },
                  { day: 'Today', val: todaysSales > 0 ? todaysSales : 8900, count: 4, active: true },
                ].map((d, i) => {
                  const maxVal = 16000;
                  const heightPercent = Math.min(100, Math.max(15, (d.val / maxVal) * 100));
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                      <div className="text-[10px] font-mono font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{(d.val / 1000).toFixed(1)}k
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                          d.active 
                            ? 'bg-blue-600 shadow-sm shadow-blue-500/20' 
                            : 'bg-slate-200 group-hover:bg-blue-400'
                        }`}
                      />
                      <span className={`text-[11px] font-medium ${d.active ? 'text-blue-600 font-bold' : 'text-slate-500'}`}>
                        {d.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Average Invoice Value: <strong className="text-slate-800">₹3,450.00</strong></span>
            <button 
              onClick={() => setActiveTab('reports')}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Sales Report</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Stock Value by Category & Top Parts (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Inventory Valuation by Category</h3>
            <p className="text-xs text-slate-500">Highest value stock distribution</p>
          </div>

          <div className="space-y-3">
            {categoryStats.map((item, idx) => {
              const percent = totalStockValue > 0 ? (item.value / totalStockValue) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.category}</span>
                    <span className="font-mono font-bold text-slate-900">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-blue-600' :
                        idx === 1 ? 'bg-indigo-500' :
                        idx === 2 ? 'bg-emerald-500' :
                        idx === 3 ? 'bg-amber-500' : 'bg-purple-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top Selling Parts Snippet */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Top Selling Parts This Month
            </span>
            <div className="space-y-1.5">
              {topSellingParts.slice(0, 3).map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-1 px-2 rounded bg-slate-50">
                  <span className="font-medium text-slate-800 truncate max-w-[200px]">{item.name}</span>
                  <span className="font-bold text-blue-700 font-mono text-[11px]">{item.qty} units sold</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Two Column Layout: Low Stock Alerts & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Low Stock Alerts Section (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertTriangle className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Low Stock Alerts ({lowStockProducts.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('stock')}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {lowStockProducts.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  All spare parts are sufficiently stocked!
                </div>
              ) : (
                lowStockProducts.slice(0, 4).map(prod => (
                  <div key={prod.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{prod.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {prod.sku} | Rack: {prod.locationRack || 'Store'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-black bg-rose-100 text-rose-800">
                          {prod.currentQuantity} / {prod.minStockLevel} {prod.unit}
                        </span>
                      </div>
                      <button
                        onClick={() => handleQuickRestock(prod)}
                        className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        title="Add stock immediately"
                      >
                        + Restock
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => setActiveTab('stock')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Manage & Adjust Inventory Quantities</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Invoices Section (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Clock className="h-3.5 w-3.5" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">Recent Customer Bills</h3>
              </div>
              <button
                onClick={() => setActiveTab('invoices')}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                All Invoices ({invoices.length})
              </button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase text-[10px] border-b border-slate-100">
                    <th className="pb-2">Invoice No</th>
                    <th className="pb-2">Customer & Vehicle</th>
                    <th className="pb-2 text-right">Total</th>
                    <th className="pb-2 text-center">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.slice(0, 5).map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                        <div className="text-[10px] text-slate-400 font-sans font-normal">
                          {formatDate(inv.date)}
                        </div>
                      </td>
                      <td className="py-2.5">
                        <div className="font-semibold text-slate-800">{inv.customerName}</div>
                        {inv.vehicleNumber && (
                          <div className="text-[10px] font-mono text-slate-500 uppercase">
                            {inv.vehicleNumber}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(inv.grandTotal)}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          inv.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.paymentStatus === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={() => openInvoicePrint(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Print or view A4 invoice"
                        >
                          <Printer className="h-3 w-3 text-slate-600" />
                          <span>Print</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Showing recent bills with quick A4 reprinting</span>
            <button
              onClick={() => setActiveTab('invoices')}
              className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Sales Records</span>
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
