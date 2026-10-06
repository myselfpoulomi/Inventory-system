import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { CreditCard, Search, DollarSign, FileText, CheckCircle2 } from 'lucide-react';

export default function PaymentsView() {
  const { payments, openInvoicePrint, invoices } = useApp();
  const [search, setSearch] = useState('');

  const filtered = payments.filter(p =>
    (p.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.invoiceNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.reference || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.mode || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

  const handleViewInvoice = (invNum) => {
    const inv = invoices.find(i => i.invoiceNumber === invNum);
    if (inv) {
      openInvoicePrint(inv);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            <span>Customer Payments & Receipts Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time audit log of cash counter collections, UPI settlements, and bank transfers
          </p>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-right">
          <span className="text-[10px] font-bold uppercase text-emerald-800 block">Total Payments Received</span>
          <span className="text-xl font-black font-mono text-emerald-700">
            {formatCurrency(totalCollected)}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search payment by customer, invoice number, or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filtered.length} payment transactions
        </span>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3">Receipt ID</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Invoice Number</th>
                <th className="py-2.5 px-3 text-center">Payment Mode</th>
                <th className="py-2.5 px-3">Transaction / Reference</th>
                <th className="py-2.5 px-3 text-right">Amount Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">{p.id}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{formatDateTime(p.date)}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{p.customerName}</td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => handleViewInvoice(p.invoiceNumber)}
                        className="font-mono font-bold text-blue-700 hover:underline cursor-pointer"
                        title="View & Print Bill"
                      >
                        {p.invoiceNumber}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {p.mode}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">{p.reference || '-'}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 text-sm">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
