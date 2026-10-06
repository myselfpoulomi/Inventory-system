import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  FilePlus,
  FileText,
  Layers,
  History,
  AlertTriangle,
  Receipt
} from 'lucide-react';

export default function Sidebar({ isMobileOpen, setIsMobileOpen }) {
  const { activeTab, setActiveTab, products, invoices } = useApp();

  const lowStockCount = products.filter(p => p.currentQuantity <= p.minStockLevel).length;

  const navItemClass = (tabKey) => {
    const isActive = activeTab === tabKey;
    return `group flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-150 cursor-pointer ${
      isActive
        ? 'bg-blue-600 text-white shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;
  };

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      
      {/* Navigation list */}
      <div className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        
        {/* BILLING SECTION */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Billing & Sales
          </span>

          <button
            onClick={() => handleTabClick('billing')}
            className={`w-full ${navItemClass('billing')}`}
          >
            <div className="flex items-center gap-2.5">
              <FilePlus className="h-4 w-4" />
              <span>Create New Bill</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === 'billing' ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700'
            }`}>
              A4 Print
            </span>
          </button>

          <button
            onClick={() => handleTabClick('invoices')}
            className={`w-full ${navItemClass('invoices')}`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4" />
              <span>Invoices History</span>
            </div>
            <span className={`text-[11px] font-mono font-medium px-2 py-0.2 rounded-full ${
              activeTab === 'invoices' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {invoices.length}
            </span>
          </button>
        </div>

        {/* INVENTORY SECTION */}
        <div className="space-y-1 pt-2 border-t border-slate-100">
          <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Inventory & Stock
          </span>

          <button
            onClick={() => handleTabClick('inventory')}
            className={`w-full ${navItemClass('inventory')}`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="h-4 w-4" />
              <span>Products Catalog</span>
            </div>
            <span className={`text-[11px] font-mono font-medium px-2 py-0.2 rounded-full ${
              activeTab === 'inventory' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {products.length}
            </span>
          </button>

          <button
            onClick={() => handleTabClick('stock')}
            className={`w-full ${navItemClass('stock')}`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="h-4 w-4" />
              <span>Stock Levels</span>
            </div>
            {lowStockCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                {lowStockCount} low
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabClick('stock-history')}
            className={`w-full ${navItemClass('stock-history')}`}
          >
            <div className="flex items-center gap-2.5">
              <History className="h-4 w-4" />
              <span>Stock Audit Trail</span>
            </div>
          </button>
        </div>

      </div>

      {/* Quick Summary at Bottom */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
            <span>Routh Automobile</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-[11px] text-slate-500">
            Active Catalog: <strong className="text-slate-800">{products.length} Parts</strong>
          </p>
          <p className="text-[11px] text-slate-500">
            Bills Issued: <strong className="text-slate-800">{invoices.length} Bills</strong>
          </p>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:block w-60 shrink-0 h-[calc(100vh-4rem)] sticky top-16">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="no-print fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-white shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
