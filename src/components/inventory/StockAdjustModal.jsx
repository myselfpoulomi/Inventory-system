import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Layers, Plus, Minus, RefreshCw, AlertCircle } from 'lucide-react';

export default function StockAdjustModal({ isOpen, onClose, product }) {
  const { adjustStock } = useApp();

  const [adjustmentType, setAdjustmentType] = useState('ADD'); // ADD, REMOVE, CORRECTION
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('Stock replenishment / Workshop receipt');

  if (!isOpen || !product) return null;

  const currentStock = product.currentQuantity;
  let previewStock = currentStock;

  if (adjustmentType === 'ADD') {
    previewStock = currentStock + (Number(quantity) || 0);
  } else if (adjustmentType === 'REMOVE') {
    previewStock = Math.max(0, currentStock - (Number(quantity) || 0));
  } else if (adjustmentType === 'CORRECTION') {
    previewStock = Math.max(0, Number(quantity) || 0);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(quantity) <= 0 && adjustmentType !== 'CORRECTION') {
      alert('Please enter a valid quantity greater than zero');
      return;
    }

    adjustStock({
      productId: product.id,
      adjustmentType,
      quantity: Number(quantity),
      reason: reason.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-400" />
            <h3 className="font-bold text-sm tracking-tight">Adjust Stock Quantity</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Product Details Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs">
          <p className="font-bold text-slate-900 text-sm">{product.name}</p>
          <div className="flex items-center gap-3 mt-1 text-slate-500 font-mono">
            <span>SKU: {product.sku}</span>
            <span>Part: {product.partNumber || '-'}</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-slate-600">Current Stock:</span>
            <span className="font-bold font-mono text-slate-900 px-2 py-0.5 rounded bg-white border border-slate-200">
              {currentStock} {product.unit}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Action Type Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Adjustment Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('ADD');
                  setReason('Consignment received / stock addition');
                }}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                  adjustmentType === 'ADD'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add (+)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('REMOVE');
                  setReason('Damaged in transit / Workshop consumption');
                }}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                  adjustmentType === 'REMOVE'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Minus className="h-3.5 w-3.5" />
                <span>Remove (-)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAdjustmentType('CORRECTION');
                  setReason('Physical warehouse audit count correction');
                }}
                className={`py-2 px-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                  adjustmentType === 'CORRECTION'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Correct (=)</span>
              </button>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {adjustmentType === 'CORRECTION' ? 'Exact New Stock Count' : 'Quantity to Adjust'} ({product.unit})
            </label>
            <input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* New Stock Preview */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">New Resulting Stock:</span>
            <span className="font-black font-mono text-sm text-blue-900">
              {previewStock} {product.unit}
            </span>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason / Reference Note *
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Physical stock count check, damaged packaging, supplier return"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              Apply Adjustment
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
