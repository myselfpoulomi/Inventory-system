import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building2,
  FileText,
  Database,
  Save,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Wrench,
  ShieldAlert
} from 'lucide-react';
import { INDIAN_STATES } from '../../utils/formatters';

export default function SettingsView() {
  const {
    settings,
    updateSettings,
    currentUser,
    resetToSampleData,
    exportBackupJSON,
    importBackupJSON,
    showToast,
  } = useApp();

  const [formData, setFormData] = useState({ ...settings });
  const [termsText, setTermsText] = useState((settings.termsAndConditions || []).join('\n'));

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleStateChange = (stCode) => {
    const found = INDIAN_STATES.find(s => s.code === stCode);
    if (found) {
      setFormData(prev => ({
        ...prev,
        stateCode: found.code,
        state: found.name
      }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (currentUser.role !== 'admin') {
      alert('Only Admin users can change business & invoice configurations.');
      return;
    }

    const cleanedTerms = termsText.split('\n').filter(t => t.trim().length > 0);
    updateSettings({
      ...formData,
      termsAndConditions: cleanedTerms,
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        importBackupJSON(json);
      } catch (err) {
        alert('Invalid JSON file format: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <span>Business, Billing & Database Settings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure automobile workshop profile, GST numbers, invoice layout, and data backup
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Business Profile & GST */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Automobile Business & GST Registration
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Business / Workshop Name *
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold uppercase focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Business Tagline / Subtitle
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                GSTIN (15-Digit Indian GST) *
              </label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase font-bold focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                PAN Number
              </label>
              <input
                type="text"
                value={formData.pan}
                onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Workshop & Store Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                City & Pincode
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-2/3 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className="w-1/3 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Home State (Place of Business)
              </label>
              <select
                value={formData.stateCode}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium"
              >
                {INDIAN_STATES.map(s => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Bank & UPI Information (Printed on A4 Invoice) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Bank Account & UPI QR Details (Printed on Invoice)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => handleChange('accountName', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={formData.ifscCode}
                onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Branch Name</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => handleChange('branch', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">UPI ID (VPA)</label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => handleChange('upiId', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-blue-700"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Invoicing Numbering & Rules */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Invoice Prefix, Numbering & Inventory Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Invoice Prefix *
              </label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase font-bold"
              />
              <span className="text-[10px] text-slate-400">e.g. APM/2026/ or INV/26-27/</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Next Invoice Number Sequence
              </label>
              <input
                type="number"
                min="1"
                value={formData.nextInvoiceNumber}
                onChange={(e) => handleChange('nextInvoiceNumber', Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Allow Negative Stock Billing
              </label>
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowNegStock"
                  checked={formData.allowNegativeStock}
                  onChange={(e) => handleChange('allowNegativeStock', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <label htmlFor="allowNegStock" className="text-xs text-slate-700">
                  Allow billing when stock is 0
                </label>
              </div>
            </div>
          </div>

          {/* Terms & Conditions textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Terms & Conditions (Printed on bottom of invoice - 1 per line)
            </label>
            <textarea
              rows={4}
              value={termsText}
              onChange={(e) => setTermsText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Invoice Footer Greeting Note
            </label>
            <input
              type="text"
              value={formData.invoiceFooterNote}
              onChange={(e) => handleChange('invoiceFooterNote', e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white"
            />
          </div>
        </div>

        {/* Section 4: Backup, Restore & Sample Reset */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Database className="h-4 w-4 text-purple-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Database Persistence, Backup & Reset
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Backup */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">Export Full Backup</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Save all products, customers, invoices, and stock movements to JSON
                </p>
              </div>
              <button
                type="button"
                onClick={exportBackupJSON}
                className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-blue-600" />
                <span>Export JSON</span>
              </button>
            </div>

            {/* Restore */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-xs text-slate-900 block">Restore from Backup</span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Upload an existing Routh Automobile JSON backup file
                </p>
              </div>
              <label className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 transition-colors cursor-pointer">
                <Upload className="h-3.5 w-3.5 text-blue-600" />
                <span>Restore JSON</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Reset */}
            <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200 flex flex-col justify-between">
              <div>
                <span className="font-bold text-xs text-rose-900 block">Reset to Sample Demo Data</span>
                <p className="text-[11px] text-rose-700 mt-1">
                  Reload fresh realistic automobile products, invoices, and customers
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all inventory and invoices to realistic automobile demo data?')) {
                    resetToSampleData();
                  }
                }}
                className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-50 border border-rose-300 rounded-lg text-xs font-semibold text-rose-800 transition-colors cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 text-rose-600" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save All Configuration Settings</span>
          </button>
        </div>

      </form>

    </div>
  );
}
