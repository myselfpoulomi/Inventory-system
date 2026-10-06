import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Package, Check, AlertCircle } from 'lucide-react';

export default function ProductFormModal({ isOpen, onClose, productToEdit }) {
  const { categories, brands, suppliers, addProduct, updateProduct, currentUser } = useApp();

  const isEditing = !!productToEdit;

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: categories[0] || 'Brake Parts',
    brand: brands[0] || 'Bosch',
    partNumber: '',
    vehicleCompatibility: '',
    unit: 'PCS',
    purchasePrice: '',
    sellingPrice: '',
    mrp: '',
    gstPercent: 18,
    currentQuantity: '',
    minStockLevel: 5,
    supplierId: suppliers[0]?.id || '',
    locationRack: '',
    description: '',
    image: '',
    isActive: true,
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        sku: productToEdit.sku || '',
        barcode: productToEdit.barcode || '',
        category: productToEdit.category || categories[0] || 'Brake Parts',
        brand: productToEdit.brand || brands[0] || 'Bosch',
        partNumber: productToEdit.partNumber || '',
        vehicleCompatibility: productToEdit.vehicleCompatibility || '',
        unit: productToEdit.unit || 'PCS',
        purchasePrice: productToEdit.purchasePrice || '',
        sellingPrice: productToEdit.sellingPrice || '',
        mrp: productToEdit.mrp || '',
        gstPercent: productToEdit.gstPercent || 18,
        currentQuantity: productToEdit.currentQuantity || 0,
        minStockLevel: productToEdit.minStockLevel || 5,
        supplierId: productToEdit.supplierId || suppliers[0]?.id || '',
        locationRack: productToEdit.locationRack || '',
        description: productToEdit.description || '',
        image: productToEdit.image || '',
        isActive: productToEdit.isActive !== false,
      });
    } else {
      setFormData({
        name: '',
        sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: `890123400${Math.floor(1000 + Math.random() * 9000)}`,
        category: categories[0] || 'Brake Parts',
        brand: brands[0] || 'Bosch',
        partNumber: '',
        vehicleCompatibility: '',
        unit: 'PCS',
        purchasePrice: '',
        sellingPrice: '',
        mrp: '',
        gstPercent: 18,
        currentQuantity: 10,
        minStockLevel: 4,
        supplierId: suppliers[0]?.id || '',
        locationRack: 'Rack A-01, Shelf 1',
        description: '',
        image: '',
        isActive: true,
      });
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter product name');
      return;
    }

    if (isEditing) {
      updateProduct(productToEdit.id, formData);
    } else {
      addProduct(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight">
                {isEditing ? `Edit Product: ${productToEdit.name}` : 'Add New Automobile Spare Part'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Enter complete OEM specifications, pricing, compatibility, and stock parameters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product / Spare Part Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Front Ceramic Brake Pad Set"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Product SKU / Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BP-BRK-1002"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono uppercase focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Section 2: Automobile Categorization */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand / OEM</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium"
              >
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">OEM Part Number</label>
              <input
                type="text"
                placeholder="e.g. 0 986 AB1 002"
                value={formData.partNumber}
                onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode</label>
              <input
                type="text"
                placeholder="e.g. 8901234001002"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>
          </div>

          {/* Section 3: Vehicle Compatibility & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Vehicle Compatibility / Fitment Model
              </label>
              <input
                type="text"
                placeholder="e.g. Maruti Suzuki Swift / Dzire / Baleno (2018+)"
                value={formData.vehicleCompatibility}
                onChange={(e) => setFormData({ ...formData, vehicleCompatibility: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Warehouse Rack / Shelf Location
              </label>
              <input
                type="text"
                placeholder="e.g. Rack A-02, Bin 4"
                value={formData.locationRack}
                onChange={(e) => setFormData({ ...formData, locationRack: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs"
              />
            </div>
          </div>

          {/* Section 4: Pricing & GST */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Pricing, Valuation & GST Rates
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Purchase Cost (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="950"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="1500"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-blue-700"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  MRP (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="1750"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  GST Rate %
                </label>
                <select
                  value={formData.gstPercent}
                  onChange={(e) => setFormData({ ...formData, gstPercent: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold"
                >
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18">18% (Standard Auto)</option>
                  <option value="28">28% (Batteries/Clutch)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Stock Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold"
                >
                  <option value="PCS">PCS (Pieces)</option>
                  <option value="SET">SET (Full Set)</option>
                  <option value="PAIR">PAIR (2 Pcs)</option>
                  <option value="CAN">CAN (Oil / Lube)</option>
                  <option value="BTL">BTL (Bottle)</option>
                  <option value="PACK">PACK</option>
                  <option value="KG">KG</option>
                  <option value="MTR">MTR (Hose/Pipe)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Inventory Quantities & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Stock Qty *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.currentQuantity}
                onChange={(e) => setFormData({ ...formData, currentQuantity: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Minimum Stock Level (Alert Threshold)
              </label>
              <input
                type="number"
                min="1"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Supplier / Vendor
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs"
              >
                <option value="">-- Choose Vendor --</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Part Description / Technical Specifications
            </label>
            <textarea
              rows={2}
              placeholder="e.g. High friction ceramic formulation with noise dampening rubber shims."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white"
            />
          </div>

          {/* Active status */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isActiveCheck"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <label htmlFor="isActiveCheck" className="text-xs font-medium text-slate-700">
              Active item in billing catalog (uncheck to archive)
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              {isEditing ? 'Save Product Changes' : 'Add to Inventory'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
