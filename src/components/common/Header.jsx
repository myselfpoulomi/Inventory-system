import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Wrench, 
  User, 
  LogOut, 
  ShieldCheck, 
  UserCheck, 
  Bell, 
  Printer, 
  PlusCircle, 
  Layers,
  ChevronDown,
  RefreshCw,
  FilePlus,
  FileText,
  Package
} from 'lucide-react';

export default function Header() {
  const { 
    settings, 
    currentUser, 
    login, 
    logout, 
    activeTab,
    setActiveTab, 
    products, 
    invoices,
    resetToSampleData 
  } = useApp();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const lowStockCount = products.filter(p => p.currentQuantity <= p.minStockLevel).length;

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          
          {/* Business Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => setActiveTab('billing')}>
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Wrench className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">
              {settings.businessName || 'Routh Automobile'}
            </span>
          </div>

          {/* Center Navigation Tabs: Just Billing & Inventory */}
          <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl">
            {/* 1. New Bill / Billing */}
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'billing'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FilePlus className="h-4 w-4" />
              <span>Billing (New Bill)</span>
            </button>

            {/* 2. Invoices History */}
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'invoices'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Invoices History</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'invoices' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {invoices.length}
              </span>
            </button>

            {/* 3. Inventory & Stock */}
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Inventory & Stock</span>
              {lowStockCount > 0 ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500 text-white">
                  {lowStockCount} low
                </span>
              ) : (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'inventory' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {products.length}
                </span>
              )}
            </button>
          </nav>

          {/* Quick Actions & User Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick New Bill Button */}
            <button
              onClick={() => setActiveTab('billing')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm cursor-pointer"
              title="Create New Automobile Bill"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">New Bill</span>
            </button>

            {/* Low Stock Notification Badge */}
            <button
              onClick={() => setActiveTab('inventory')}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title={`${lowStockCount} items low on stock`}
            >
              <Bell className="h-5 w-5" />
              {lowStockCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {lowStockCount}
                </span>
              )}
            </button>

            {/* User Dropdown & Role Indicator */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left cursor-pointer"
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                  currentUser.role === 'admin' ? 'bg-indigo-600' : 'bg-emerald-600'
                }`}>
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-xs">
                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                    {currentUser.name}
                  </div>
                  <span className={`inline-block font-medium uppercase text-[10px] px-1 rounded ${
                    currentUser.role === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {currentUser.role}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs text-slate-500">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-500">{currentUser.email}</p>
                  </div>

                  <div className="px-3 py-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Switch Account:
                  </div>

                  <button
                    onClick={() => {
                      login('admin');
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      currentUser.role === 'admin' ? 'bg-indigo-50 font-semibold text-indigo-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-indigo-600" />
                      <span>Admin (Full Access)</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      login('user');
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      currentUser.role === 'user' ? 'bg-emerald-50 font-semibold text-emerald-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-emerald-600" />
                      <span>User (Billing & Stock)</span>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      if (window.confirm('Reset sample demo inventory and invoices?')) {
                        resetToSampleData();
                        setUserDropdownOpen(false);
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                    <span>Reset Sample Demo Data</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
