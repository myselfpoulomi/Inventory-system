import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Building2,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  DollarSign,
  Edit,
  Trash2,
  X,
  CreditCard
} from 'lucide-react';

export default function SupplierListView() {
  const {
    suppliers,
    purchases,
    addSupplier,
    updateSupplier,
    recordSupplierPayment,
    currentUser,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [notes, setNotes] = useState('');

  // Payment Modal state
  const [payModalSupplier, setPayModalSupplier] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payRef, setPayRef] = useState('');

  const filteredSuppliers = suppliers.filter(s =>
    (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.contactPerson || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.gstin || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setSupplierToEdit(null);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setGstin('');
    setState('Maharashtra');
    setNotes('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setSupplierToEdit(sup);
    setName(sup.name || '');
    setContactPerson(sup.contactPerson || '');
    setPhone(sup.phone || '');
    setEmail(sup.email || '');
    setAddress(sup.address || '');
    setGstin(sup.gstin || '');
    setState(sup.state || 'Maharashtra');
    setNotes(sup.notes || '');
    setIsFormOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      gstin: gstin.trim().toUpperCase(),
      state,
      stateCode: '27',
      notes: notes.trim(),
    };

    if (supplierToEdit) {
      updateSupplier(supplierToEdit.id, payload);
    } else {
      addSupplier(payload);
    }

    setIsFormOpen(false);
  };

  const handlePaySupplier = (e) => {
    e.preventDefault();
    if (!payModalSupplier || Number(payAmount) <= 0) return;

    recordSupplierPayment({
      supplierId: payModalSupplier.id,
      amount: Number(payAmount),
      mode: 'Bank Transfer',
      reference: payRef || 'Vendor settlement',
      notes: 'Payment to OEM vendor',
    });

    setPayModalSupplier(null);
  };

  return (
    <div className="space-y-5 pb-12">
      
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span>OEM Suppliers & Vendors</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorised automotive parts distributors, oil depots, and consignment payables
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('new-purchase')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <ShoppingBag className="h-4 w-4 text-blue-600" />
            <span>New Purchase Order</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search supplier name, contact person, or GSTIN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredSuppliers.length} vendor partners
        </span>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSuppliers.map(sup => {
          const supPurchases = purchases.filter(p => p.supplierId === sup.id);
          const totalBought = supPurchases.reduce((acc, p) => acc + (p.totalAmount || 0), 0);

          return (
            <div
              key={sup.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{sup.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Attn: {sup.contactPerson || 'Sales Desk'}</p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    sup.outstandingPayable > 0
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Payable: {formatCurrency(sup.outstandingPayable)}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{sup.phone}</span>
                  </div>
                  {sup.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{sup.email}</span>
                    </div>
                  )}
                  {sup.gstin && (
                    <div className="text-[11px] font-mono text-slate-500 mt-1">
                      GSTIN: <strong className="text-slate-700">{sup.gstin}</strong>
                    </div>
                  )}
                </div>

                {sup.notes && (
                  <p className="text-[11px] text-slate-500 italic mt-2.5 bg-slate-50 p-2 rounded border border-slate-100">
                    {sup.notes}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  {supPurchases.length} consignments
                </div>

                <div className="flex items-center gap-1.5">
                  {sup.outstandingPayable > 0 && (
                    <button
                      onClick={() => {
                        setPayModalSupplier(sup);
                        setPayAmount(sup.outstandingPayable);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Pay Due
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEdit(sup)}
                    className="p-1 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 cursor-pointer"
                    title="Edit Supplier"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* PAY SUPPLIER MODAL */}
      {payModalSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">Pay Supplier: {payModalSupplier.name}</h3>
              <button onClick={() => setPayModalSupplier(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handlePaySupplier} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span>Current Outstanding Payable:</span>
                  <span className="font-mono font-bold text-amber-800">
                    {formatCurrency(payModalSupplier.outstandingPayable)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Amount to Settle (₹) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={payModalSupplier.outstandingPayable}
                  step="1"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold font-mono focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bank / NEFT / IMPS Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. NEFT/HDFC2299881"
                  value={payRef}
                  onChange={(e) => setPayRef(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayModalSupplier(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  Record Vendor Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">
                {supplierToEdit ? 'Edit Supplier' : 'Add New OEM Supplier'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Supplier / Firm Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bosch Auto Distribution Ltd"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Suresh Patil"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98220 11223"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    placeholder="27AABCB1234D1Z2"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="sales@supplier.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Warehouse Address</label>
                <input
                  type="text"
                  placeholder="e.g. Plot 4B, Chakan MIDC, Pune"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Notes / Product Specialization</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Official distributor for brakes, filters and wipers."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
