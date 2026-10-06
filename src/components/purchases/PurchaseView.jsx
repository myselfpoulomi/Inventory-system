import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Building2,
  Package,
  Layers,
  FileText
} from 'lucide-react';

export default function PurchaseView({ initialSubTab = 'new' }) {
  const {
    suppliers,
    products,
    purchases,
    createPurchase,
    settings,
    setActiveTab,
    showToast,
  } = useApp();

  const [subTab, setSubTab] = useState(initialSubTab); // 'new' or 'history'

  // Purchase Order Form State
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [purchaseInvoiceNumber, setPurchaseInvoiceNumber] = useState(
    () => `PO-INW-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([
    { productId: '', quantity: 10, rate: 0, gstPercent: 18 }
  ]);
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  // Line item handlers
  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 5, rate: 0, gstPercent: 18 }]);
  };

  const handleRemoveItem = (idx) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleProductSelect = (idx, prodId) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;

    const updated = [...items];
    updated[idx] = {
      ...updated[idx],
      productId: prod.id,
      name: prod.name,
      sku: prod.sku,
      rate: prod.purchasePrice,
      gstPercent: prod.gstPercent || 18,
    };
    setItems(updated);
  };

  const handleItemChange = (idx, field, val) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    setItems(updated);
  };

  // Calculations
  let subtotal = 0;
  let taxAmount = 0;
  items.forEach(it => {
    const lineGross = (Number(it.quantity) || 0) * (Number(it.rate) || 0);
    const lineGst = (lineGross * (Number(it.gstPercent) || 0)) / 100;
    subtotal += lineGross;
    taxAmount += lineGst;
  });
  const totalAmount = Math.round(subtotal + taxAmount);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSupplier) {
      alert('Please select a supplier');
      return;
    }

    const validItems = items.filter(it => it.productId && Number(it.quantity) > 0);
    if (validItems.length === 0) {
      alert('Please select at least one valid automobile product to purchase.');
      return;
    }

    const payload = {
      purchaseInvoiceNumber: purchaseInvoiceNumber.trim(),
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      date: new Date(purchaseDate).toISOString(),
      items: validItems.map(it => {
        const prod = products.find(p => p.id === it.productId);
        const gross = (Number(it.quantity) || 0) * (Number(it.rate) || 0);
        const gst = (gross * (Number(it.gstPercent) || 0)) / 100;
        return {
          productId: it.productId,
          name: prod?.name || it.name,
          quantity: Number(it.quantity),
          rate: Number(it.rate),
          gstPercent: Number(it.gstPercent),
          total: Math.round(gross + gst),
        };
      }),
      subtotal,
      taxAmount,
      totalAmount,
      paidAmount: paidAmount ? Number(paidAmount) : totalAmount,
      paymentMode,
      status: 'RECEIVED',
    };

    createPurchase(payload);

    // Reset
    setItems([{ productId: '', quantity: 10, rate: 0, gstPercent: 18 }]);
    setPaidAmount('');
    setPurchaseInvoiceNumber(`PO-INW-${Math.floor(1000 + Math.random() * 9000)}`);
    setSubTab('history');
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            <span>Purchase Management & Inward Consignments</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supplier inward stock entries that automatically replenish warehouse product quantities
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSubTab('new')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              subTab === 'new' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-600'
            }`}
          >
            + New Inward Purchase
          </button>
          <button
            onClick={() => setSubTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              subTab === 'history' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-600'
            }`}
          >
            Purchase History ({purchases.length})
          </button>
        </div>
      </div>

      {/* NEW PURCHASE TAB */}
      {subTab === 'new' && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column (8 cols): Supplier & Line Items */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Supplier & Consignment Meta */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>Supplier & Consignment Details</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Supplier *
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier Invoice / Challan No *
                  </label>
                  <input
                    type="text"
                    required
                    value={purchaseInvoiceNumber}
                    onChange={(e) => setPurchaseInvoiceNumber(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Consignment Inward Date
                  </label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Purchased Products (Will Increase Stock)
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                >
                  + Add Product Row
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                      <th className="py-2 px-2 w-8">#</th>
                      <th className="py-2 px-2 min-w-[200px]">Product / Part</th>
                      <th className="py-2 px-2 w-24 text-center">Inward Qty</th>
                      <th className="py-2 px-2 w-28 text-right">Cost Rate (₹)</th>
                      <th className="py-2 px-2 w-20 text-center">GST %</th>
                      <th className="py-2 px-2 w-24 text-right">Total (₹)</th>
                      <th className="py-2 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => {
                      const gross = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                      const gst = (gross * (Number(item.gstPercent) || 0)) / 100;
                      const lineTotal = gross + gst;

                      return (
                        <tr key={idx}>
                          <td className="py-2 px-2 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-2">
                            <select
                              value={item.productId}
                              onChange={(e) => handleProductSelect(idx, e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                            >
                              <option value="">-- Choose Spare Part --</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} [{p.sku}] (Current Stock: {p.currentQuantity})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-center font-mono font-bold"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.rate}
                              onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-right font-mono"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <select
                              value={item.gstPercent}
                              onChange={(e) => handleItemChange(idx, 'gstPercent', e.target.value)}
                              className="bg-slate-50 border border-slate-300 rounded px-1.5 py-1 text-xs"
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </td>
                          <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(lineTotal)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Financial Totals & Save */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block border-b border-slate-100 pb-2">
                Consignment Total & Payment
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST Input Credit:</span>
                  <span className="font-mono font-medium">{formatCurrency(taxAmount)}</span>
                </div>

                <div className="bg-slate-900 text-white p-3.5 rounded-xl mt-2 flex justify-between items-center">
                  <span className="text-xs uppercase font-semibold text-slate-300">Total Purchase:</span>
                  <span className="text-xl font-black font-mono">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount Paid to Supplier (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder={`e.g. ${totalAmount}`}
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold font-mono text-emerald-700 focus:bg-white"
                  />
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setPaidAmount(totalAmount)}
                      className="text-[10px] text-blue-600 font-semibold hover:underline"
                    >
                      Paid in Full
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setPaidAmount(0)}
                      className="text-[10px] text-rose-600 font-semibold hover:underline"
                    >
                      Unpaid (Credit)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Receive Stock & Save PO</span>
                </button>
              </div>
            </div>
          </div>

        </form>
      )}

      {/* HISTORY TAB */}
      {subTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Purchase Inward Consignments History</h3>
            <span className="text-xs text-slate-500">{purchases.length} consignments recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-2.5 px-3">Purchase Inv #</th>
                  <th className="py-2.5 px-3">Supplier Name</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-center">Items Count</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-right">GST (Input)</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3 text-right">Paid</th>
                  <th className="py-2.5 px-3 text-right">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchases.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700">
                      {p.purchaseInvoiceNumber}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {p.supplierName}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {formatDate(p.date)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {p.items?.length || 0} parts
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {formatCurrency(p.subtotal)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {formatCurrency(p.taxAmount)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-950">
                      {formatCurrency(p.totalAmount)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-700">
                      {formatCurrency(p.paidAmount)}
                    </td>
                    <td className={`py-3 px-3 text-right font-mono font-bold ${
                      p.balanceDue > 0 ? 'text-amber-700' : 'text-slate-500'
                    }`}>
                      {formatCurrency(p.balanceDue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
