import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Users,
  Search,
  Plus,
  Car,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  Edit,
  Trash2,
  X,
  CreditCard,
  PlusCircle,
  Building2
} from 'lucide-react';

export default function CustomerListView() {
  const {
    customers,
    invoices,
    payments,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    openInvoicePrint,
    currentUser,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null); // for detail drawer
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [stateCode, setStateCode] = useState('27');
  const [notes, setNotes] = useState('');
  const [vehicles, setVehicles] = useState([
    { vehicleNumber: '', makeModel: '', vin: '', lastKm: '' }
  ]);

  const filteredCustomers = customers.filter(c =>
    (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.phone || '').includes(searchQuery) ||
    (c.vehicles || []).some(v => (v.vehicleNumber || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setCustomerToEdit(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setGstin('');
    setState('Maharashtra');
    setStateCode('27');
    setNotes('');
    setVehicles([{ vehicleNumber: '', makeModel: '', vin: '', lastKm: '' }]);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (cust) => {
    setCustomerToEdit(cust);
    setName(cust.name || '');
    setPhone(cust.phone || '');
    setEmail(cust.email || '');
    setAddress(cust.address || '');
    setGstin(cust.gstin || '');
    setState(cust.state || 'Maharashtra');
    setStateCode(cust.stateCode || '27');
    setNotes(cust.notes || '');
    setVehicles(cust.vehicles && cust.vehicles.length > 0 ? cust.vehicles : [{ vehicleNumber: '', makeModel: '', vin: '', lastKm: '' }]);
    setIsFormOpen(true);
  };

  const handleAddVehicleRow = () => {
    setVehicles([...vehicles, { vehicleNumber: '', makeModel: '', vin: '', lastKm: '' }]);
  };

  const handleVehicleChange = (idx, field, val) => {
    const updated = [...vehicles];
    updated[idx] = { ...updated[idx], [field]: val };
    setVehicles(updated);
  };

  const handleRemoveVehicle = (idx) => {
    if (vehicles.length === 1) return;
    setVehicles(vehicles.filter((_, i) => i !== idx));
  };

  const handleSaveCustomer = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const cleanVehicles = vehicles
      .filter(v => v.vehicleNumber.trim())
      .map(v => ({
        ...v,
        vehicleNumber: v.vehicleNumber.trim().toUpperCase()
      }));

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      gstin: gstin.trim().toUpperCase(),
      state,
      stateCode,
      notes: notes.trim(),
      vehicles: cleanVehicles,
    };

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, payload);
    } else {
      addCustomer(payload);
    }

    setIsFormOpen(false);
  };

  const handleDelete = (cust) => {
    if (currentUser.role !== 'admin') {
      alert('Only Admins can delete customers.');
      return;
    }
    if (window.confirm(`Delete customer "${cust.name}"?`)) {
      deleteCustomer(cust.id);
      if (selectedCustomer?.id === cust.id) setSelectedCustomer(null);
    }
  };

  // Get Invoices & Payments for selected customer
  const customerInvoices = selectedCustomer 
    ? invoices.filter(i => i.customerId === selectedCustomer.id) 
    : [];
  const customerPayments = selectedCustomer
    ? payments.filter(p => p.customerId === selectedCustomer.id)
    : [];
  const totalPurchasesAmount = customerInvoices.reduce((acc, i) => acc + i.grandTotal, 0);

  return (
    <div className="space-y-5 pb-12">
      
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Customer & Fleet Directory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automobile client records, multi-vehicle registrations, invoice history, and balance dues
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search customer by name, phone, or vehicle registration..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredCustomers.length} registered customers
        </span>
      </div>

      {/* Main Grid: Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(cust => (
          <div
            key={cust.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-xs transition-all p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{cust.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{cust.phone || 'No phone'}</span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  cust.outstandingBalance > 0
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {cust.outstandingBalance > 0 ? `Due: ₹${cust.outstandingBalance}` : 'Settled'}
                </span>
              </div>

              {cust.address && (
                <p className="text-[11px] text-slate-600 mt-2 truncate flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                  <span>{cust.address}</span>
                </p>
              )}

              {/* Registered Vehicles */}
              <div className="mt-3 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Vehicles ({cust.vehicles?.length || 0})
                </span>
                <div className="space-y-1">
                  {(cust.vehicles || []).slice(0, 2).map((v, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-slate-50 px-2 py-1 rounded">
                      <span className="font-mono font-bold text-slate-800 uppercase text-[11px]">
                        {v.vehicleNumber}
                      </span>
                      <span className="text-slate-500 text-[10px] truncate max-w-[140px]">
                        {v.makeModel}
                      </span>
                    </div>
                  ))}
                  {(cust.vehicles?.length || 0) > 2 && (
                    <div className="text-[10px] text-blue-600 font-medium">
                      + {(cust.vehicles?.length || 0) - 2} more vehicles...
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedCustomer(cust)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
              >
                <span>View Full Profile</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(cust)}
                  className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 cursor-pointer"
                  title="Edit Customer"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(cust)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 cursor-pointer"
                    title="Delete Customer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* CUSTOMER DETAIL MODAL / DRAWER */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedCustomer.phone} | GSTIN: {selectedCustomer.gstin || 'Unregistered'}
                </p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Financial Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Total Invoiced</span>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    {formatCurrency(totalPurchasesAmount)}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Total Bills</span>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    {customerInvoices.length}
                  </div>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-[10px] font-bold uppercase text-rose-800">Outstanding Balance</span>
                  <div className="text-lg font-bold font-mono text-rose-700">
                    {formatCurrency(selectedCustomer.outstandingBalance)}
                  </div>
                </div>
              </div>

              {/* Registered Vehicles */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                  <Car className="h-4 w-4 text-blue-600" />
                  <span>Customer Fleet & Vehicle History</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(selectedCustomer.vehicles || []).map((v, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div className="font-mono font-bold text-slate-900 uppercase">{v.vehicleNumber}</div>
                      <div className="text-slate-600">{v.makeModel}</div>
                      {v.lastKm && <div className="text-[11px] text-slate-400 mt-1">Last KM: {v.lastKm}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoices History Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Invoice & Billing History
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Invoice No</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                        <th className="py-2 px-3 text-center">Status</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-blue-700">{inv.invoiceNumber}</td>
                          <td className="py-2 px-3 text-slate-600">{formatDate(inv.date)}</td>
                          <td className="py-2 px-3 text-right font-mono font-bold">{formatCurrency(inv.grandTotal)}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-slate-100 text-slate-700 uppercase">
                              {inv.paymentStatus}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => openInvoicePrint(inv)}
                              className="text-xs text-blue-600 font-semibold hover:underline"
                            >
                              Print A4
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ADD / EDIT CUSTOMER FORM MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-5 py-4 flex justify-between items-center">
              <h3 className="font-bold text-sm">
                {customerToEdit ? 'Edit Customer' : 'Add New Automobile Customer'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer / Fleet Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Deshmukh"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98220 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. customer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 27AAAPD9876P1Z3"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g. Plot 12, Baner, Pune"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              {/* Multiple Vehicles */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase text-slate-700">
                    Registered Vehicles (Multiple Allowed)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddVehicleRow}
                    className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Vehicle</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {vehicles.map((v, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <input
                        type="text"
                        placeholder="Reg No (MH 12 AB 1234)"
                        value={v.vehicleNumber}
                        onChange={(e) => handleVehicleChange(idx, 'vehicleNumber', e.target.value)}
                        className="w-36 bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono uppercase font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Make & Model (Maruti Swift)"
                        value={v.makeModel}
                        onChange={(e) => handleVehicleChange(idx, 'makeModel', e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs"
                      />
                      {vehicles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVehicle(idx)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Customer Notes / Preferences</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Regular client, prefers genuine Castrol oils."
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
                  Save Customer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
