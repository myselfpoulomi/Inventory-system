import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateInvoiceTotals, formatCurrency, INDIAN_STATES } from '../../utils/formatters';
import { numberToWordsIndian } from '../../utils/numberToWords';
import confetti from 'canvas-confetti';
import {
  Plus,
  Trash2,
  Search,
  UserPlus,
  Car,
  Receipt,
  Printer,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Percent,
  Sparkles,
  Barcode,
  Layers,
  Phone,
  MapPin,
  Calendar,
  X
} from 'lucide-react';

export default function BillingView() {
  const {
    products,
    customers,
    settings,
    createInvoice,
    openInvoicePrint,
    addCustomer,
    showToast,
  } = useApp();

  // Customer & Vehicle State (direct text entry)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedVehicleNumber, setSelectedVehicleNumber] = useState('');
  const [selectedVehicleModel, setSelectedVehicleModel] = useState('');
  const [odometerKm, setOdometerKm] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [placeOfSupply, setPlaceOfSupply] = useState(settings.stateCode || '19');
  const [notes, setNotes] = useState('');

  // Invoice Items State
  const [items, setItems] = useState([
    {
      productId: '',
      name: '',
      sku: '',
      partNumber: '',
      quantity: 1,
      unit: 'PCS',
      rate: 0,
      discount: 0,
      gstPercent: 18,
      vehicleCompatibility: '',
      availableStock: 0,
    }
  ]);

  // Overall Discount & Payment State
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [paymentReference, setPaymentReference] = useState('');

  // Handle typing customer name with auto-fill if customer matches
  const handleCustomerNameChange = (e) => {
    const val = e.target.value;
    setCustomerName(val);
    const matched = customers.find(c => c.name.toLowerCase() === val.trim().toLowerCase());
    if (matched) {
      if (!customerPhone && matched.phone) setCustomerPhone(matched.phone);
      if (!customerAddress && matched.address) setCustomerAddress(matched.address);
      if (matched.vehicles && matched.vehicles.length > 0) {
        if (!selectedVehicleNumber) setSelectedVehicleNumber(matched.vehicles[0].vehicleNumber || '');
        if (!selectedVehicleModel) setSelectedVehicleModel(matched.vehicles[0].makeModel || '');
      }
      if (matched.stateCode) {
        setPlaceOfSupply(matched.stateCode);
      }
    }
  };

  // Live Calculations
  const totals = calculateInvoiceTotals({
    items,
    overallDiscount,
    businessStateCode: settings.stateCode || '19',
    customerStateCode: placeOfSupply,
    isGstInclusive: false,
  });

  // Keep paid amount synced if user wants full payment
  const balanceDue = Math.max(0, totals.grandTotal - (Number(paidAmount) || 0));

  const setFullPayment = () => {
    setPaidAmount(totals.grandTotal);
  };

  const setZeroPayment = () => {
    setPaidAmount(0);
  };

  // Add Item Row
  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      {
        productId: '',
        name: '',
        sku: '',
        partNumber: '',
        quantity: 1,
        unit: 'PCS',
        rate: 0,
        discount: 0,
        gstPercent: 18,
        vehicleCompatibility: '',
        availableStock: 0,
      }
    ]);
  };

  // Remove Item Row
  const removeItemRow = (index) => {
    if (items.length === 1) {
      // Just clear the single row
      setItems([{
        productId: '',
        name: '',
        sku: '',
        partNumber: '',
        quantity: 1,
        unit: 'PCS',
        rate: 0,
        discount: 0,
        gstPercent: 18,
        vehicleCompatibility: '',
        availableStock: 0,
      }]);
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Product Selection handler
  const handleProductSelect = (index, productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: product.id,
        name: product.name,
        sku: product.sku,
        partNumber: product.partNumber || product.sku,
        rate: product.sellingPrice,
        unit: product.unit || 'PCS',
        gstPercent: product.gstPercent || 18,
        vehicleCompatibility: product.vehicleCompatibility || '',
        availableStock: product.currentQuantity,
        quantity: 1,
      };
      return updated;
    });
  };

  // Item Field Change handler
  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  // Reset form
  const handleReset = () => {
    if (window.confirm('Clear all entered bill data?')) {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setSelectedVehicleNumber('');
      setSelectedVehicleModel('');
      setOdometerKm('');
      setItems([{
        productId: '',
        name: '',
        sku: '',
        partNumber: '',
        quantity: 1,
        unit: 'PCS',
        rate: 0,
        discount: 0,
        gstPercent: 18,
        vehicleCompatibility: '',
        availableStock: 0,
      }]);
      setOverallDiscount(0);
      setPaidAmount(0);
      setNotes('');
    }
  };

  // Submit Invoice
  const handleSubmitInvoice = (andPrint = false) => {
    if (!customerName.trim()) {
      alert('Please write the customer name for this bill.');
      return;
    }

    // Check valid items
    const validItems = items.filter(it => it.productId && Number(it.quantity) > 0);
    if (validItems.length === 0) {
      alert('Please add at least one valid automobile product to the bill.');
      return;
    }

    // Check stock if negative stock is disabled
    if (!settings.allowNegativeStock) {
      for (const it of validItems) {
        if (it.quantity > it.availableStock) {
          alert(`Cannot sell ${it.quantity} of "${it.name}". Only ${it.availableStock} in stock.`);
          return;
        }
      }
    }

    try {
      let matchedCustomer = customers.find(c => c.name.toLowerCase() === customerName.trim().toLowerCase());
      let customerId = matchedCustomer ? matchedCustomer.id : `cust-${Date.now()}`;

      if (!matchedCustomer) {
        addCustomer({
          name: customerName.trim(),
          phone: customerPhone.trim(),
          email: '',
          address: customerAddress.trim() || 'Counter Sale / Local',
          gstin: '',
          state: INDIAN_STATES.find(s => s.code === placeOfSupply)?.name || settings.state,
          stateCode: placeOfSupply,
          vehicles: selectedVehicleNumber ? [{
            vehicleNumber: selectedVehicleNumber.trim().toUpperCase(),
            makeModel: selectedVehicleModel.trim() || 'Automobile',
            vin: '',
            lastKm: odometerKm.trim()
          }] : [],
          outstandingBalance: 0
        });
      }

      const invoicePayload = {
        date: invoiceDate ? new Date(invoiceDate).toISOString() : new Date().toISOString(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : new Date().toISOString(),
        customerId: customerId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || matchedCustomer?.phone || '',
        customerAddress: customerAddress.trim() || matchedCustomer?.address || 'Counter Sale / Local',
        customerGstin: matchedCustomer?.gstin || '',
        customerState: INDIAN_STATES.find(s => s.code === placeOfSupply)?.name || settings.state,
        customerStateCode: placeOfSupply,
        vehicleNumber: selectedVehicleNumber.trim().toUpperCase(),
        vehicleModel: selectedVehicleModel.trim(),
        odometerKm: odometerKm.trim(),
        items: totals.items,
        subtotal: totals.subtotal,
        totalDiscount: totals.totalDiscount,
        taxableAmount: totals.taxableAmount,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,
        totalTax: totals.totalTax,
        roundOff: totals.roundOff,
        grandTotal: totals.grandTotal,
        paidAmount: Number(paidAmount) || 0,
        paymentMode,
        paymentReference: paymentReference || (paymentMode === 'Cash' ? 'Cash Counter' : 'Online'),
        notes: notes.trim(),
      };

      const createdInvoice = createInvoice(invoicePayload);

      // Confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore if canvas-confetti unavailable
      }

      // If Print requested, open preview
      if (andPrint) {
        openInvoicePrint(createdInvoice);
      }

      // Reset items for next bill
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setSelectedVehicleNumber('');
      setSelectedVehicleModel('');
      setOdometerKm('');
      setItems([{
        productId: '',
        name: '',
        sku: '',
        partNumber: '',
        quantity: 1,
        unit: 'PCS',
        rate: 0,
        discount: 0,
        gstPercent: 18,
        vehicleCompatibility: '',
        availableStock: 0,
      }]);
      setPaidAmount(0);
      setOverallDiscount(0);
      setNotes('');

    } catch (err) {
      alert(`Error creating invoice: ${err.message}`);
    }
  };

  const nextInvNumber = `${settings.invoicePrefix || 'APM/2026/'}${settings.nextInvoiceNumber || 104}`;

  return (
    <div className="space-y-5 pb-12">
      
      {/* Page Title & Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Receipt className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Create GST Tax Invoice
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 font-mono">
              {nextInvNumber}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automobile spare parts counter sales, workshop billing, and instant A4 printing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
          
          <button
            onClick={() => handleSubmitInvoice(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors shadow-2xs cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Bill</span>
          </button>

          <button
            onClick={() => handleSubmitInvoice(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Save & Print (A4)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column (8 cols): Customer, Vehicle, & Line Items */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Section 1: Customer & Vehicle Information */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Car className="h-4 w-4 text-blue-600" />
                <span>Customer & Vehicle Information</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Write customer name directly
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Customer Name"
                  value={customerName}
                  onChange={handleCustomerNameChange}
                  list="customer-suggestions"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                />
                <datalist id="customer-suggestions">
                  {customers.map(c => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              {/* Customer Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98224 88990"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                />
              </div>

              {/* Customer Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Address / Area
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat 402, Royal Palms, Wakad, Pune"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                />
              </div>

              {/* Vehicle Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Number (Reg. No.)
                </label>
                <input
                  type="text"
                  placeholder="e.g. MH 12 AB 4590"
                  value={selectedVehicleNumber}
                  onChange={(e) => setSelectedVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                />
              </div>

              {/* Vehicle Model */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Make & Model
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maruti Swift VXi (2019)"
                  value={selectedVehicleModel}
                  onChange={(e) => setSelectedVehicleModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                />
              </div>

              {/* Odometer KM Reading */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Odometer / KM Reading
                </label>
                <input
                  type="text"
                  placeholder="e.g. 48,500 KM"
                  value={odometerKm}
                  onChange={(e) => setOdometerKm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900"
                />
              </div>

            </div>

            {/* Date & Place of Supply */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Place of Supply (GST)</label>
                <select
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium"
                >
                  {INDIAN_STATES.map(st => (
                    <option key={st.code} value={st.code}>
                      {st.code} - {st.name} {st.code === settings.stateCode ? '(Intra-State CGST+SGST)' : '(Inter-State IGST)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Section 2: Items Table */}
          <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Parts & Line Items ({items.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Select parts from inventory, edit rates or add line discounts
                </span>
              </div>
              <button
                type="button"
                onClick={addItemRow}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Add Item Row</span>
              </button>
            </div>

            {/* Responsive Table of Line Items */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="py-2 px-2 rounded-l-md w-8">#</th>
                    <th className="py-2 px-2 min-w-[220px]">Product / Part</th>
                    <th className="py-2 px-2 w-20 text-center">Stock</th>
                    <th className="py-2 px-2 w-20 text-center">Qty</th>
                    <th className="py-2 px-2 w-24 text-right">Rate (₹)</th>
                    <th className="py-2 px-2 w-20 text-right">Disc (₹)</th>
                    <th className="py-2 px-2 w-16 text-center">GST %</th>
                    <th className="py-2 px-2 w-24 text-right">Net (₹)</th>
                    <th className="py-2 px-2 w-10 text-center rounded-r-md"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const gross = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                    const disc = Number(item.discount) || 0;
                    const taxable = Math.max(0, gross - disc);
                    const gst = (taxable * (Number(item.gstPercent) || 0)) / 100;
                    const lineTotal = taxable + gst;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-2 font-mono text-slate-400 text-center">
                          {idx + 1}
                        </td>

                        {/* Product Picker */}
                        <td className="py-2.5 px-2">
                          <select
                            value={item.productId}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-blue-500 focus:bg-white"
                          >
                            <option value="">-- Choose Spare Part / Product --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} | {p.sku} | ₹{p.sellingPrice} | Stock: {p.currentQuantity}
                              </option>
                            ))}
                          </select>
                          {item.partNumber && (
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                              <span>Part: <strong className="font-mono text-slate-700">{item.partNumber}</strong></span>
                              {item.vehicleCompatibility && (
                                <span className="text-slate-400 truncate max-w-[200px]">Fit: {item.vehicleCompatibility}</span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Available Stock Indicator */}
                        <td className="py-2.5 px-2 text-center">
                          {item.productId ? (
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.availableStock <= 0
                                ? 'bg-rose-100 text-rose-700'
                                : item.availableStock < 5
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {item.availableStock} {item.unit}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Qty Input */}
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-center font-bold font-mono focus:bg-white"
                          />
                        </td>

                        {/* Rate Input */}
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-right font-mono focus:bg-white"
                          />
                        </td>

                        {/* Discount */}
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            step="1"
                            value={item.discount}
                            onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1 text-xs text-right font-mono focus:bg-white"
                          />
                        </td>

                        {/* GST % */}
                        <td className="py-2.5 px-2 text-center">
                          <select
                            value={item.gstPercent}
                            onChange={(e) => handleItemChange(idx, 'gstPercent', e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-md px-1 py-1 text-xs text-center font-medium"
                          >
                            <option value="0">0%</option>
                            <option value="5">5%</option>
                            <option value="12">12%</option>
                            <option value="18">18%</option>
                            <option value="28">28%</option>
                          </select>
                        </td>

                        {/* Line Total */}
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(lineTotal)}
                        </td>

                        {/* Delete Row */}
                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeItemRow(idx)}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Remove row"
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

            {/* Quick Add Row Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={addItemRow}
                className="w-full py-2 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Another Spare Part or Labor Charge</span>
              </button>
            </div>

            {/* Mechanic Notes / Remarks */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Workshop Remarks / Mechanics Notes (Printed on invoice)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Brake pads replaced, brake bleeding completed, customer took old parts."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white"
              />
            </div>

          </div>

        </div>

        {/* Right Column (4 cols): GST Breakdown, Totals & Payment Settlement */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Billing Summary Box */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Invoice Financial Summary</span>
              <span className="text-[10px] text-blue-600 font-semibold">
                {totals.isIntraState ? 'Intra-State (CGST+SGST)' : 'Inter-State (IGST)'}
              </span>
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Gross:</span>
                <span className="font-mono font-medium text-slate-900">{formatCurrency(totals.subtotal)}</span>
              </div>

              {/* Overall Discount */}
              <div className="flex justify-between items-center text-slate-600">
                <span>Special Bill Discount (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={overallDiscount}
                  onChange={(e) => setOverallDiscount(e.target.value)}
                  className="w-24 bg-slate-50 border border-slate-300 rounded px-2 py-0.5 text-right font-mono text-xs"
                />
              </div>

              <div className="flex justify-between text-slate-700 font-medium pt-1 border-t border-slate-100">
                <span>Taxable Value:</span>
                <span className="font-mono text-slate-900">{formatCurrency(totals.taxableAmount)}</span>
              </div>

              {totals.isIntraState ? (
                <>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Output CGST:</span>
                    <span className="font-mono">{formatCurrency(totals.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 text-[11px]">
                    <span>Output SGST:</span>
                    <span className="font-mono">{formatCurrency(totals.sgst)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Output IGST:</span>
                  <span className="font-mono">{formatCurrency(totals.igst)}</span>
                </div>
              )}

              {totals.roundOff !== 0 && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Round Off:</span>
                  <span className="font-mono">
                    {totals.roundOff > 0 ? `+${formatCurrency(totals.roundOff)}` : formatCurrency(totals.roundOff)}
                  </span>
                </div>
              )}

              {/* Highlighted Grand Total */}
              <div className="bg-slate-900 text-white p-3.5 rounded-xl mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-300">
                    Grand Total
                  </span>
                  <span className="text-xl font-black font-mono tracking-tight">
                    {formatCurrency(totals.grandTotal)}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 italic mt-1 leading-snug">
                  {numberToWordsIndian(totals.grandTotal)}
                </p>
              </div>

            </div>

            {/* Payment Settlement Section */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Payment Collection
              </span>

              {/* Quick settlement buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={setFullPayment}
                  className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200 transition-colors cursor-pointer"
                >
                  Full Paid
                </button>
                <button
                  type="button"
                  onClick={setZeroPayment}
                  className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold rounded-lg border border-rose-200 transition-colors cursor-pointer"
                >
                  Unpaid (Credit)
                </button>
              </div>

              {/* Amount Paid Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Received (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold font-mono text-emerald-700 focus:bg-white"
                />
              </div>

              {/* Balance Due Display */}
              <div className="flex justify-between items-center p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700">Balance Due:</span>
                <span className={`font-mono font-bold text-sm ${balanceDue > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {formatCurrency(balanceDue)}
                </span>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium focus:bg-white"
                >
                  <option value="Cash">Cash (Counter)</option>
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT / IMPS</option>
                  <option value="Card">Debit / Credit Card (POS)</option>
                  <option value="Credit">Credit (Client Account)</option>
                </select>
              </div>

              {/* Payment Reference */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Txn Ref / Cheque No / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/628192841/GPay"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:bg-white"
                />
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => handleSubmitInvoice(true)}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Save & Print Invoice (A4)</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmitInvoice(false)}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Invoice Without Printing</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
