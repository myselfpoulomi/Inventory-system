import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  FileText,
  Search,
  Filter,
  Printer,
  Eye,
  Trash2,
  DollarSign,
  Copy,
  ChevronRight,
  CreditCard,
  X,
  AlertCircle
} from 'lucide-react';

export default function InvoiceListView() {
  const {
    invoices,
    customers,
    deleteInvoice,
    openInvoicePrint,
    recordCustomerPayment,
    currentUser,
    setActiveTab,
    showToast,
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PAID, PARTIAL, UNPAID
  const [customerFilter, setCustomerFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Payment Recording Modal state
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMode, setPayMode] = useState('UPI');
  const [payRef, setPayRef] = useState('');

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch =
        (inv.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.vehicleNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.customerPhone || '').includes(searchQuery);

      const matchStatus = statusFilter === 'ALL' || inv.paymentStatus === statusFilter;
      const matchCustomer = customerFilter === 'ALL' || inv.customerId === customerFilter;

      let matchDate = true;
      if (startDate) {
        matchDate = matchDate && (inv.date || '').slice(0, 10) >= startDate;
      }
      if (endDate) {
        matchDate = matchDate && (inv.date || '').slice(0, 10) <= endDate;
      }

      return matchSearch && matchStatus && matchCustomer && matchDate;
    });
  }, [invoices, searchQuery, statusFilter, customerFilter, startDate, endDate]);

  const handleDelete = (inv) => {
    if (currentUser.role !== 'admin') {
      alert('Only Admin users can cancel or delete invoices.');
      return;
    }
    if (window.confirm(`Cancel invoice ${inv.invoiceNumber}? Stock will be automatically restored back to inventory and customer outstanding balance reversed.`)) {
      deleteInvoice(inv.id);
    }
  };

  const handleOpenPaymentModal = (inv) => {
    setPaymentModalInvoice(inv);
    setPayAmount(inv.balanceDue);
    setPayRef('');
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    if (!paymentModalInvoice || Number(payAmount) <= 0) return;

    recordCustomerPayment({
      invoiceId: paymentModalInvoice.id,
      customerId: paymentModalInvoice.customerId,
      amount: Number(payAmount),
      mode: payMode,
      reference: payRef || 'Settlement receipt',
      notes: `Balance payment against ${paymentModalInvoice.invoiceNumber}`,
    });

    setPaymentModalInvoice(null);
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Sales & Tax Invoices History</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete GST billing registry, payment collections, and instant A4 reprint
          </p>
        </div>

        <button
          onClick={() => setActiveTab('billing')}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <span>+ Create New Bill</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice #, customer, vehicle no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 cursor-pointer"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="PAID">Paid Only</option>
            <option value="PARTIAL">Partially Paid</option>
            <option value="UNPAID">Unpaid (Credit)</option>
          </select>

          {/* Customer Filter */}
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 cursor-pointer max-w-[160px] truncate"
          >
            <option value="ALL">All Customers</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Date range */}
          <div className="flex items-center gap-1">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700"
              title="From date"
            />
            <span className="text-slate-400 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700"
              title="To date"
            />
          </div>

        </div>

      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-3 px-3">Invoice No</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Customer & Vehicle</th>
                <th className="py-3 px-3 text-right">Subtotal</th>
                <th className="py-3 px-3 text-right">Tax (GST)</th>
                <th className="py-3 px-3 text-right">Grand Total</th>
                <th className="py-3 px-3 text-right">Paid</th>
                <th className="py-3 px-3 text-right">Balance</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No sales invoices found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Invoice No */}
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">
                        {inv.invoiceNumber}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-3 text-slate-600 font-medium">
                        {formatDate(inv.date)}
                      </td>

                      {/* Customer & Vehicle */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{inv.customerName}</div>
                        {inv.vehicleNumber && (
                          <div className="text-[10px] font-mono text-slate-500 uppercase">
                            {inv.vehicleNumber} {inv.vehicleModel ? `• ${inv.vehicleModel}` : ''}
                          </div>
                        )}
                      </td>

                      {/* Subtotal */}
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {formatCurrency(inv.subtotal)}
                      </td>

                      {/* Tax */}
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {formatCurrency(inv.totalTax)}
                      </td>

                      {/* Grand Total */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-950">
                        {formatCurrency(inv.grandTotal)}
                      </td>

                      {/* Paid */}
                      <td className="py-3 px-3 text-right font-mono text-emerald-700 font-medium">
                        {formatCurrency(inv.paidAmount)}
                      </td>

                      {/* Balance */}
                      <td className={`py-3 px-3 text-right font-mono font-bold ${
                        inv.balanceDue > 0 ? 'text-rose-700' : 'text-slate-500'
                      }`}>
                        {formatCurrency(inv.balanceDue)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          inv.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.paymentStatus === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {inv.paymentStatus}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Print / View Modal */}
                          <button
                            onClick={() => openInvoicePrint(inv)}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                            title="Print A4 Tax Invoice"
                          >
                            <Printer className="h-3 w-3 text-blue-600" />
                            <span>Print</span>
                          </button>

                          {/* Record Payment if balance due */}
                          {inv.balanceDue > 0 && (
                            <button
                              onClick={() => handleOpenPaymentModal(inv)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                              title="Record Customer Payment"
                            >
                              <DollarSign className="h-3 w-3" />
                              <span>Pay</span>
                            </button>
                          )}

                          {/* Delete (Admin only) */}
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => handleDelete(inv)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Cancel & Restore Stock"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {paymentModalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <h3 className="font-bold text-sm">
                  Record Payment for {paymentModalInvoice.invoiceNumber}
                </h3>
              </div>
              <button
                onClick={() => setPaymentModalInvoice(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Customer:</span>
                  <strong className="text-slate-900">{paymentModalInvoice.customerName}</strong>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-500">Total Invoice:</span>
                  <span className="font-mono">{formatCurrency(paymentModalInvoice.grandTotal)}</span>
                </div>
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>Balance Outstanding:</span>
                  <span className="font-mono">{formatCurrency(paymentModalInvoice.balanceDue)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Amount Received (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={paymentModalInvoice.balanceDue}
                  step="1"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold font-mono text-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode
                </label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Cash">Cash (Counter)</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Transaction / Cheque Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/6281900/Settlement"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalInvoice(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Confirm & Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
