import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import BillingView from './components/billing/BillingView';
import InventoryView from './components/inventory/InventoryView';
import InvoiceListView from './components/invoices/InvoiceListView';
import LoginView from './components/auth/LoginView';
import InvoicePrintModal from './components/invoices/InvoicePrintModal';
import ProductFormModal from './components/inventory/ProductFormModal';
import { CheckCircle2, AlertCircle, Info, Menu } from 'lucide-react';

function MainApp() {
  const {
    isAuthenticated,
    activeTab,
    toast,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGlobalProductModalOpen, setIsGlobalProductModalOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Main Screen Content (Hidden when printing invoice) */}
      <div className="no-print flex-1 flex flex-col">
        {/* Top Header */}
        <Header />

        {/* Mobile Bar */}
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            <Menu className="h-4 w-4 text-blue-600" />
            <span>Menu</span>
          </button>

          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700">
            {activeTab === 'billing' ? 'Billing Counter' : activeTab === 'invoices' ? 'Invoices' : 'Inventory'}
          </span>
        </div>

        {/* Main Layout */}
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar
            isMobileOpen={isMobileMenuOpen}
            setIsMobileOpen={setIsMobileMenuOpen}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {/* 1. BILLING / NEW BILL */}
            {activeTab === 'billing' && <BillingView />}

            {/* 2. INVOICES HISTORY */}
            {activeTab === 'invoices' && <InvoiceListView />}

            {/* 3. INVENTORY & STOCK */}
            {activeTab === 'inventory' && (
              <InventoryView initialSubTab="products" />
            )}

            {activeTab === 'stock' && (
              <InventoryView initialSubTab="stock" />
            )}

            {activeTab === 'stock-history' && (
              <InventoryView initialSubTab="history" />
            )}
          </main>
        </div>
      </div>

      {/* Global Invoice A4 Print Modal */}
      <InvoicePrintModal />

      {/* Global Add Product Modal */}
      <ProductFormModal
        isOpen={isGlobalProductModalOpen}
        onClose={() => setIsGlobalProductModalOpen(false)}
        productToEdit={null}
      />

      {/* Toast Notification Alert (Hidden when printing) */}
      {toast && (
        <div className="no-print fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold ${
            toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-800'
              : toast.type === 'info'
              ? 'bg-slate-900 text-white border-slate-800'
              : 'bg-emerald-900 text-white border-emerald-800'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="h-4 w-4 text-blue-400 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
