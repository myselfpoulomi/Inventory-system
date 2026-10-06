import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  PieChart,
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  CreditCard,
  Building2,
  Package,
  AlertTriangle,
  DollarSign,
  FileText
} from 'lucide-react';

export default function ReportsView() {
  const {
    invoices,
    purchases,
    products,
    customers,
    suppliers,
    settings,
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState('sales'); // 'sales', 'gst', 'stock', 'profit', 'outstanding'
  const [dateRange, setDateRange] = useState('ALL');

  // Sales totals
  const totalSalesRevenue = invoices.reduce((acc, i) => acc + (i.grandTotal || 0), 0);
  const totalSalesTaxable = invoices.reduce((acc, i) => acc + (i.taxableAmount || 0), 0);
  const totalOutputGst = invoices.reduce((acc, i) => acc + (i.totalTax || 0), 0);

  // Purchase totals
  const totalPurchasesAmount = purchases.reduce((acc, p) => acc + (p.totalAmount || 0), 0);
  const totalInputGst = purchases.reduce((acc, p) => acc + (p.taxAmount || 0), 0);

  // Net GST Liability = Output Tax - Input Tax Credit
  const netGstPayable = Math.max(0, totalOutputGst - totalInputGst);

  // Estimated Gross Profit (Revenue - Cost of Goods Sold)
  let totalCogs = 0;
  invoices.forEach(inv => {
    (inv.items || []).forEach(it => {
      const prod = products.find(p => p.id === it.productId);
      const cost = prod ? prod.purchasePrice : (it.rate * 0.7);
      totalCogs += cost * (Number(it.quantity) || 1);
    });
  });
  const grossProfit = totalSalesTaxable - totalCogs;
  const profitMarginPercent = totalSalesTaxable > 0 ? ((grossProfit / totalSalesTaxable) * 100).toFixed(1) : 0;

  // Outstanding
  const customerReceivables = customers.reduce((acc, c) => acc + (c.outstandingBalance || 0), 0);
  const supplierPayables = suppliers.reduce((acc, s) => acc + (s.outstandingPayable || 0), 0);

  // Export current report view to CSV
  const handleExportReportCSV = () => {
    let headers = [];
    let rows = [];
    let filename = `Routh_Automobile_Report_${activeReportTab}.csv`;

    if (activeReportTab === 'sales') {
      headers = ['Invoice No', 'Date', 'Customer', 'Vehicle No', 'Subtotal', 'GST', 'Grand Total', 'Paid', 'Balance', 'Status'];
      rows = invoices.map(i => [
        `"${i.invoiceNumber}"`,
        `"${formatDate(i.date)}"`,
        `"${i.customerName}"`,
        `"${i.vehicleNumber || ''}"`,
        i.subtotal,
        i.totalTax,
        i.grandTotal,
        i.paidAmount,
        i.balanceDue,
        `"${i.paymentStatus}"`
      ]);
    } else if (activeReportTab === 'gst') {
      headers = ['Type', 'Ref Invoice', 'Date', 'Party', 'GSTIN', 'Taxable Value', 'CGST', 'SGST', 'IGST', 'Total GST'];
      const salesRows = invoices.map(i => [
        'Output GST (Sales)',
        `"${i.invoiceNumber}"`,
        `"${formatDate(i.date)}"`,
        `"${i.customerName}"`,
        `"${i.customerGstin || ''}"`,
        i.taxableAmount,
        i.cgst,
        i.sgst,
        i.igst,
        i.totalTax
      ]);
      const purchRows = purchases.map(p => [
        'Input ITC (Purchase)',
        `"${p.purchaseInvoiceNumber}"`,
        `"${formatDate(p.date)}"`,
        `"${p.supplierName}"`,
        '',
        p.subtotal,
        (p.taxAmount / 2).toFixed(2),
        (p.taxAmount / 2).toFixed(2),
        0,
        p.taxAmount
      ]);
      rows = [...salesRows, ...purchRows];
    } else if (activeReportTab === 'stock') {
      headers = ['Part Name', 'SKU', 'Category', 'Brand', 'Current Stock', 'Unit', 'Purchase Rate', 'Selling Price', 'Stock Valuation'];
      rows = products.map(p => [
        `"${p.name}"`,
        `"${p.sku}"`,
        `"${p.category}"`,
        `"${p.brand}"`,
        p.currentQuantity,
        p.unit,
        p.purchasePrice,
        p.sellingPrice,
        (p.currentQuantity * p.purchasePrice)
      ]);
    } else if (activeReportTab === 'outstanding') {
      headers = ['Party Type', 'Name', 'Phone', 'Address', 'Balance Amount (₹)'];
      const custRows = customers.filter(c => c.outstandingBalance > 0).map(c => [
        'Customer (Receivable)',
        `"${c.name}"`,
        `"${c.phone}"`,
        `"${c.address || ''}"`,
        c.outstandingBalance
      ]);
      const supRows = suppliers.filter(s => s.outstandingPayable > 0).map(s => [
        'Supplier (Payable)',
        `"${s.name}"`,
        `"${s.phone}"`,
        `"${s.address || ''}"`,
        s.outstandingPayable
      ]);
      rows = [...custRows, ...supRows];
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-600" />
            <span>Financial Reports & GST Tax Audit</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automobile parts sales metrics, input/output GST reconciliation, stock valuation, and receivables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportReportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="h-4 w-4 text-blue-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold max-w-2xl">
        <button
          onClick={() => setActiveReportTab('sales')}
          className={`flex-1 py-2 rounded-lg text-center transition-colors cursor-pointer ${
            activeReportTab === 'sales' ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sales Report
        </button>
        <button
          onClick={() => setActiveReportTab('gst')}
          className={`flex-1 py-2 rounded-lg text-center transition-colors cursor-pointer ${
            activeReportTab === 'gst' ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          GST Tax Report
        </button>
        <button
          onClick={() => setActiveReportTab('stock')}
          className={`flex-1 py-2 rounded-lg text-center transition-colors cursor-pointer ${
            activeReportTab === 'stock' ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Stock Valuation
        </button>
        <button
          onClick={() => setActiveReportTab('profit')}
          className={`flex-1 py-2 rounded-lg text-center transition-colors cursor-pointer ${
            activeReportTab === 'profit' ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Profit Estimation
        </button>
        <button
          onClick={() => setActiveReportTab('outstanding')}
          className={`flex-1 py-2 rounded-lg text-center transition-colors cursor-pointer ${
            activeReportTab === 'outstanding' ? 'bg-white shadow-2xs text-blue-700' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Outstanding Aging
        </button>
      </div>

      {/* TAB 1: SALES REPORT */}
      {activeReportTab === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Gross Billing Revenue</span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {formatCurrency(totalSalesRevenue)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">From {invoices.length} issued invoices</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Tax Collected</span>
              <div className="text-2xl font-black font-mono text-blue-700 mt-1">
                {formatCurrency(totalOutputGst)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Output CGST, SGST & IGST</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Cash / Paid Realized</span>
              <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
                {formatCurrency(invoices.reduce((a, b) => a + b.paidAmount, 0))}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Unrealized Balance: {formatCurrency(customerReceivables)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900">Sales Invoices Breakdown</h3>
              <span className="text-xs text-slate-500">{invoices.length} invoices</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Invoice No</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Vehicle</th>
                    <th className="py-2.5 px-3 text-right">Taxable</th>
                    <th className="py-2.5 px-3 text-right">GST</th>
                    <th className="py-2.5 px-3 text-right">Grand Total</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{inv.invoiceNumber}</td>
                      <td className="py-2.5 px-3 text-slate-600">{formatDate(inv.date)}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{inv.customerName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 uppercase text-[11px]">{inv.vehicleNumber || '-'}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(inv.taxableAmount)}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(inv.totalTax)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">{formatCurrency(inv.grandTotal)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 text-slate-700 uppercase">
                          {inv.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GST TAX REPORT */}
      {activeReportTab === 'gst' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Output GST (Sales)</span>
              <div className="text-2xl font-black font-mono text-rose-700 mt-1">
                {formatCurrency(totalOutputGst)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Tax collected on automobile spare parts</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Input Tax Credit (Purchases)</span>
              <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
                {formatCurrency(totalInputGst)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Tax paid on vendor consignments</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Net GST Liability</span>
              <div className="text-2xl font-black font-mono text-blue-700 mt-1">
                {formatCurrency(netGstPayable)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Output GST minus eligible Input Tax Credit</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              GST Return Filing Summary (GSTR-1 & GSTR-3B Estimation)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg space-y-1.5">
                <span className="font-bold text-slate-800 uppercase text-[10px]">Taxable Turnover</span>
                <div className="flex justify-between text-slate-600">
                  <span>Taxable Sales Turnover:</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(totalSalesTaxable)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Intra-State CGST (Maharashtra 27):</span>
                  <span className="font-mono">{formatCurrency(totalOutputGst / 2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Intra-State SGST (Maharashtra 27):</span>
                  <span className="font-mono">{formatCurrency(totalOutputGst / 2)}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg space-y-1.5">
                <span className="font-bold text-slate-800 uppercase text-[10px]">Input Credit Available</span>
                <div className="flex justify-between text-slate-600">
                  <span>Inward Purchase Consignments:</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(totalPurchasesAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Input CGST Claimable:</span>
                  <span className="font-mono text-emerald-700">{formatCurrency(totalInputGst / 2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Input SGST Claimable:</span>
                  <span className="font-mono text-emerald-700">{formatCurrency(totalInputGst / 2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STOCK VALUATION */}
      {activeReportTab === 'stock' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Inventory Stock Valuation Report</h3>
              <p className="text-xs text-slate-500">Total Purchase Cost Valuation vs Potential Selling Realization</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Holding Value</span>
              <span className="text-base font-black font-mono text-slate-900">
                {formatCurrency(products.reduce((acc, p) => acc + (p.currentQuantity * p.purchasePrice), 0))}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Spare Part</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Holding Qty</th>
                  <th className="py-2.5 px-3 text-right">Cost Price (₹)</th>
                  <th className="py-2.5 px-3 text-right">Selling Price (₹)</th>
                  <th className="py-2.5 px-3 text-right">Total Cost Value</th>
                  <th className="py-2.5 px-3 text-right">Expected Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => {
                  const costVal = p.currentQuantity * p.purchasePrice;
                  const sellVal = p.currentQuantity * p.sellingPrice;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {p.name}
                        <div className="text-[10px] text-slate-400 font-mono">{p.sku} | {p.partNumber || '-'}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{p.category}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold">{p.currentQuantity} {p.unit}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(p.purchasePrice)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-blue-700 font-semibold">{formatCurrency(p.sellingPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(costVal)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">{formatCurrency(sellVal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PROFIT ESTIMATION */}
      {activeReportTab === 'profit' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Taxable Sales Revenue</span>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {formatCurrency(totalSalesTaxable)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase">Cost of Goods Sold (COGS)</span>
              <div className="text-2xl font-black font-mono text-slate-600 mt-1">
                {formatCurrency(totalCogs)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <span className="text-xs font-bold text-emerald-800 uppercase">Estimated Gross Profit</span>
              <div className="text-2xl font-black font-mono text-emerald-700 mt-1">
                {formatCurrency(grossProfit)}
              </div>
              <p className="text-[11px] text-emerald-800 font-semibold mt-1">
                Profit Margin: {profitMarginPercent}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: OUTSTANDING RECEIVABLES & PAYABLES */}
      {activeReportTab === 'outstanding' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Customers */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
              <h3 className="font-bold text-sm text-slate-900">Customer Receivables (Pending)</h3>
              <span className="font-mono font-bold text-rose-700 text-sm">{formatCurrency(customerReceivables)}</span>
            </div>
            <div className="space-y-2">
              {customers.filter(c => c.outstandingBalance > 0).map(c => (
                <div key={c.id} className="flex justify-between items-center p-2 rounded bg-slate-50 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <div className="text-[11px] text-slate-500">{c.phone}</div>
                  </div>
                  <span className="font-mono font-bold text-rose-700">{formatCurrency(c.outstandingBalance)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suppliers */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
              <h3 className="font-bold text-sm text-slate-900">Supplier Payables (Due)</h3>
              <span className="font-mono font-bold text-slate-900 text-sm">{formatCurrency(supplierPayables)}</span>
            </div>
            <div className="space-y-2">
              {suppliers.filter(s => s.outstandingPayable > 0).map(s => (
                <div key={s.id} className="flex justify-between items-center p-2 rounded bg-slate-50 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{s.name}</span>
                    <div className="text-[11px] text-slate-500">Attn: {s.contactPerson}</div>
                  </div>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(s.outstandingPayable)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
